import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { History, Pencil, Trash2 } from 'lucide-react';
import type { EtmfDocument, EtmfScope } from '@/types';
import type { RowAction } from '@/components/data-grid';
import { notify, useEtmfStore, useSitesStore, useUsersStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { userNameById } from '@/features/user-common';
import { createId } from '@/utils/id.utils';
import { nowIso } from '@/utils/date.utils';
import { etmfFiles } from '@/store/etmf.store';
import { useSessionStore } from '@/store/session.store';
import { isSameText } from '@/utils/string.utils';
import { ETMF_LABELS as L, buildEtmfColumns, compareSrNo, etmfScopeKey } from '../constants/etmf.constants';
import { buildEtmfSchema, type EtmfFormValues } from '../schemas/etmf.schema';

function downloadVersion(id?: string) {
  const file = id ? etmfFiles.get(id) : undefined;
  if (!file) { notify.info('The file is unavailable in this session.'); return; }
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const EMPTY: EtmfFormValues = { srNo: '', title: '', documentDate: '', version: '', validityDate: '', fileName: '' };

/** eTMF Documents (project or site level): ordered list, add / edit in a dialog, delete = archive. */
export function useEtmfList(scope: EtmfScope) {
  const { projectId = '', siteId = '' } = useParams();
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId && x.projectId === projectId));
  const documents = useEtmfStore((s) => s.documents);
  const addDocument = useEtmfStore((s) => s.addDocument);
  const updateDocument = useEtmfStore((s) => s.updateDocument);
  const archiveDocument = useEtmfStore((s) => s.archiveDocument);
  const users = useUsersStore((s) => s.users);
  const can = usePermissionChecker();

  const moduleKey = etmfScopeKey(scope);
  const canAdd = can(`${moduleKey}.new` as const);
  const canEdit = can(`${moduleKey}.edit` as const);
  const canDelete = can(`${moduleKey}.delete` as const);

  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File>();
  const [history, setHistory] = useState<EtmfDocument>();
  const [editing, setEditing] = useState<EtmfDocument | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EtmfDocument | null>(null);

  const rows = useMemo(
    () =>
      documents
        .filter((d) => !d.isArchived && d.scope === scope && d.projectId === projectId && (scope === 'project' || d.siteId === siteId))
        .sort((a, b) => compareSrNo(a.srNo, b.srNo)),
    [documents, scope, projectId, siteId],
  );

  // Read when validating, so one schema serves "add" and every "edit".
  const editingIdRef = useRef<string | null>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const schema = useMemo(
    () => buildEtmfSchema((srNo) => rowsRef.current.some((d) => d.id !== editingIdRef.current && isSameText(d.srNo, srNo))),
    [],
  );
  const form = useForm<EtmfFormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const openCreate = () => {
    setFile(undefined);
    editingIdRef.current = null;
    setEditing(null);
    form.reset(EMPTY);
    setIsOpen(true);
  };

  const openEdit = (document: EtmfDocument) => {
    setFile(undefined);
    editingIdRef.current = document.id;
    setEditing(document);
    form.reset({
      srNo: document.srNo,
      title: document.title,
      documentDate: document.documentDate ?? '',
      version: document.version ?? '',
      validityDate: document.validityDate ?? '',
      fileName: document.fileName,
    });
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const handleSubmit = form.handleSubmit((values) => {
    if (values.documentDate && values.validityDate && values.validityDate < values.documentDate) {
      form.setError('validityDate', { message: 'Validity date must be on or after the document date.' });
      return;
    }
    if (!file && !editing) {
      form.setError('fileName', { message: 'Choose a document file.' });
      return;
    }
    if (file && (!/\.(pdf|docx|xlsx|jpe?g|png)$/i.test(file.name) || !file.size || file.size > 25 * 1024 * 1024)) {
      form.setError('fileName', { message: 'Use a nonempty PDF, Word, Excel, JPEG, or PNG file up to 25 MB.' });
      return;
    }
    const version = values.version?.trim();
    if (file && editing && (!version || version === editing.version ||
      editing.fileVersions?.some((entry) => entry.version === version))) {
      form.setError('version', { message: 'Enter a new version number for the replacement file.' });
      return;
    }
    const fileVersion = file ? {
      id: createId('etmf-file'), fileName: file.name, version: version || undefined,
      uploadedAt: nowIso(), uploadedBy: useSessionStore.getState().currentUserId ?? '',
    } : undefined;
    if (fileVersion && file) etmfFiles.set(fileVersion.id, file);
    const input = {
      srNo: values.srNo.trim(),
      title: values.title.trim(),
      documentDate: values.documentDate || undefined,
      version: values.version?.trim() || undefined,
      validityDate: values.validityDate || undefined,
      fileName: values.fileName,
      fileVersion,
    };
    if (editing) {
      updateDocument(editing.id, input);
      notify.success(L.saved(input.title));
    } else {
      addDocument(scope, projectId, siteId, input);
      notify.success(L.added(input.title));
    }
    close();
  });

  const columns = useMemo(
    () =>
      buildEtmfColumns({
        userName: (id) => userNameById(users, id),
        onOpenFile: (d) => downloadVersion(d.fileVersions?.[0]?.id),
      }),
    [users],
  );

  const rowActions = (document: EtmfDocument): RowAction[] => {
    const actions: RowAction[] = [{ key: 'history', label: 'Version history', icon: History, onClick: () => setHistory(document) }];
    if (canEdit) {actions.push({ key: 'edit', label: L.edit, icon: Pencil, onClick: () => openEdit(document) });}
    if (canDelete) {
      actions.push({ key: 'delete', label: L.delete, icon: Trash2, tone: 'danger', onClick: () => setPendingDelete(document) });
    }
    return actions;
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) {return;}
    archiveDocument(pendingDelete.id);
    notify.success(L.deleted(pendingDelete.title));
    setPendingDelete(null);
  };

  return {
    title: L.title[scope],
    description: scope === 'project' ? L.description.project : L.description.site(site?.siteCode ?? ''),
    rows,
    columns,
    rowActions,
    history, closeHistory: () => setHistory(undefined), downloadVersion,
    canAdd,
    onAdd: openCreate,
    modal: {
      isOpen,
      isEdit: !!editing,
      title: editing ? L.editTitle : L.addTitle,
      form,
      close,
      handleSubmit,
      setFile,
    },
    confirm: {
      isOpen: !!pendingDelete,
      title: L.deleteTitle,
      message: L.deleteMessage(pendingDelete?.title ?? ''),
      confirmLabel: L.delete,
      tone: 'danger' as const,
      onConfirm: handleConfirmDelete,
      onCancel: () => setPendingDelete(null),
    },
  };
}

export type EtmfListModel = ReturnType<typeof useEtmfList>;

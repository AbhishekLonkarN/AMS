import type { EtmfDocument, EtmfFileVersion, EtmfScope, Id } from '@/types';
import { ETMF_SEED } from '@/data/site-documents.seed';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { createId } from '@/utils/id.utils';
import { nowIso } from '@/utils/date.utils';
import { createAppStore } from './store.config';
import { recordAudit, recordFieldChanges, type AuditField } from './audit.store';
import { useSessionStore } from './session.store';

export interface EtmfInput {
  srNo: string;
  title: string;
  documentDate?: string;
  version?: string;
  validityDate?: string;
  fileName: string;
  fileVersion?: EtmfFileVersion;
}

interface EtmfState {
  documents: EtmfDocument[];
  addDocument: (scope: EtmfScope, projectId: Id, siteId: Id | undefined, input: EtmfInput) => EtmfDocument;
  updateDocument: (id: Id, input: EtmfInput) => void;
  /** Deleting archives: eTMF content is regulatory evidence, so the record stays. */
  archiveDocument: (id: Id) => void;
}

// File bytes are kept in the same demo session as clinical workflow edits.
export const etmfFiles = new Map<Id, File>();

const page = (scope: EtmfScope) => (scope === 'project' ? AUDIT_PAGES.etmfProject : AUDIT_PAGES.etmfSite);

const FIELDS: AuditField<EtmfDocument>[] = [
  { key: 'srNo', label: 'Document Sr. No.' },
  { key: 'title', label: 'Document Title' },
  { key: 'documentDate', label: 'Document Date' },
  { key: 'version', label: 'Document Version No.' },
  { key: 'validityDate', label: 'Document Validity Date' },
  { key: 'fileName', label: 'File' },
];

export const useEtmfStore = createAppStore<EtmfState>('etmf', (set, get) => ({
  documents: ETMF_SEED,

  addDocument: (scope, projectId, siteId, input) => {
    const { fileVersion, ...fields } = input;
    const document: EtmfDocument = {
      ...fields,
      fileVersions: fileVersion ? [fileVersion] : [],
      id: createId('etmf'),
      scope,
      projectId,
      siteId: scope === 'site' ? siteId : undefined,
      uploadedAt: nowIso(),
      uploadedBy: useSessionStore.getState().currentUserId ?? '',
      isArchived: false,
    };
    set((s) => ({ documents: [...s.documents, document] }));
    recordAudit({
      page: page(scope),
      event: `Added document ${document.srNo} ${document.title}`,
      changedTo: document.fileName,
      projectId,
      siteId: document.siteId,
    });
    return document;
  },

  updateDocument: (id, input) => {
    const before = get().documents.find((d) => d.id === id);
    if (!before) {return;}
    const { fileVersion, ...fields } = input;
    const after = {
      ...before, ...fields,
      fileVersions: fileVersion ? [fileVersion, ...(before.fileVersions ?? [])] : before.fileVersions,
    };
    set((s) => ({ documents: s.documents.map((d) => (d.id === id ? after : d)) }));
    recordFieldChanges({
      page: page(before.scope),
      subject: `document ${before.title}`,
      before,
      after,
      fields: FIELDS,
      context: { projectId: before.projectId, siteId: before.siteId },
    });
  },

  archiveDocument: (id) => {
    const document = get().documents.find((d) => d.id === id);
    if (!document) {return;}
    set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, isArchived: true } : d)) }));
    recordAudit({
      page: page(document.scope),
      event: `Deleted document ${document.srNo} ${document.title}`,
      originalValue: document.fileName,
      changedTo: 'Archived',
      projectId: document.projectId,
      siteId: document.siteId,
    });
  },
}));

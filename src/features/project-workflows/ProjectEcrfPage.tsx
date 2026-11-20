import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEcrfTemplateDesign, listEcrfTemplates } from '@/api/ecrf-templates.api';
import { DynamicForm, type FormBuilderConfig, type FieldType } from '@/components/dynamic-form';
import { ConfirmDialog } from '@/components/feedback';
import { SelectField } from '@/components/form';
import { PageHeader } from '@/components/layout';
import { FormBuilder, dbConfigToBuilderConfig, toDbConfig, type FormBuilderHandle } from '@/features/form-builder';
import { usePermission } from '@/rbac';
import { notify, useProjectsStore } from '@/store';
import type { EcrfTemplate, Project } from '@/types';

const PROJECT_FIELD_TYPES: readonly FieldType[] = [
  'text', 'textarea', 'number', 'select', 'multiselect', 'date', 'datetime', 'currency', 'phone', 'email', 'address', 'checkbox',
];

function ProjectEcrfEditor({ project }: { project: Project }) {
  const [config, setConfig] = useState<FormBuilderConfig>(() => dbConfigToBuilderConfig(project.ecrf?.config));
  const [source, setSource] = useState(project.ecrf?.sourceTemplateId);
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<EcrfTemplate[]>([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'load' | 'publish'>();
  const builder = useRef<FormBuilderHandle>(null);
  const save = useProjectsStore((state) => state.saveEcrf);
  const canEdit = usePermission('projectEcrf.edit');
  const canCreate = usePermission('projectEcrf.new');
  const canLoad = usePermission('projectEcrf.affiliate');
  const editable = !project.databaseLock && !project.ecrf?.publishedAt && (project.ecrf ? canEdit : canCreate || canEdit);
  const group = project.productGroupId;

  useEffect(() => {
    if (!group || !editable || !canLoad) return;
    let active = true;
    setLoading(true);
    setLoadError('');
    const readTemplates = async () => {
      const items = await listEcrfTemplates();
      if (!active) return;
      setTemplates(items.filter((template) => template.status === 'active' && template.productGroupId === group));
    };
    void readTemplates()
      .catch(() => { if (active) setLoadError('Templates are unavailable. You can continue editing the project design.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [group, editable, canLoad]);

  const transferTemplate = async () => {
    if (!editable || !canLoad || !templates.some((template) => template.id === templateId)) return;
    setLoading(true);
    try {
      const design = await getEcrfTemplateDesign(templateId);
      const copy = toDbConfig(design.config);
      if (!save(project.id, copy, templateId)) {
        notify.error('The project design is read-only.');
        return;
      }
      setConfig(dbConfigToBuilderConfig(copy));
      setSource(templateId);
      notify.success('Template copied to the project.');
    } catch {
      notify.error('Unable to load the selected template.');
    } finally {
      setLoading(false);
    }
  };

  const persist = (publish: boolean) => {
    if (!editable || !builder.current?.validate() || !config.sections.length) {
      if (!config.sections.length) notify.error('Add at least one form before saving.');
      return;
    }
    if (publish && config.sections.some((section) => !section.fields.length || section.fields.some((field) =>
      !PROJECT_FIELD_TYPES.some((type) => type === field.type) || field.conditional_source,
    ))) {
      notify.error('Before publishing, give each form at least one field and use field types supported in participant entry.');
      return;
    }
    if (!save(project.id, toDbConfig(config), source, publish)) {
      notify.error('The project design is read-only.');
      return;
    }
    notify.success(publish ? 'Project eCRF published.' : 'Draft saved.');
  };

  return (
    <div className="page-container">
      <PageHeader
        title="eCRF of Project"
        description={project.name}
        actions={<span className="badge badge-soft badge-primary">{project.ecrf?.publishedAt ? 'Published v1' : 'Draft'}</span>}
      />
      {editable && canLoad && (
        <section className="section-card flex flex-wrap items-end gap-3">
          <SelectField
            label="Active eCRF template"
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
            options={templates.map((template) => ({ value: template.id, label: template.name }))}
            disabled={loading || !group}
          />
          <button type="button" className="btn btn-secondary" disabled={!templateId || loading} onClick={() => setAction('load')}>Load template</button>
          <p className="w-full text-sm" role={loadError ? 'alert' : undefined}>
            {loadError || (!group ? 'Set a Product Group on the project to load its templates.' : 'Loading a template creates an independent project copy.')}
          </p>
        </section>
      )}
      {editable ? (
        <>
          <FormBuilder ref={builder} value={config} onChange={setConfig} fieldTypes={PROJECT_FIELD_TYPES} />
          {config.sections.length > 1 && (
            <section className="section-card space-y-3">
              <h2 className="text-lg font-semibold">Form progression</h2>
              <div className="form-grid">
                {config.sections.slice(0, -1).map((section, index) => (
                  <SelectField key={section.uid ?? index} label={section.title || `Form ${index + 1}`}
                    value={typeof section.meta?.progression === 'string' ? section.meta.progression : ''}
                    placeholder="No prerequisite"
                    options={[{ value: 'hard', label: 'Submit to open next form' }, { value: 'soft', label: 'Save or submit to open next form' }]}
                    onChange={(event) => {
                      const progression = event.target.value;
                      setConfig((current) => ({
                        ...current,
                        sections: current.sections.map((item, position) =>
                          index === position ? { ...item, meta: { ...item.meta, progression } } : item),
                      }));
                    }} />
                ))}
              </div>
            </section>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => persist(false)}>Save draft</button>
            <button type="button" className="btn btn-primary" disabled={loading} onClick={() => setAction('publish')}>Publish eCRF</button>
          </div>
        </>
      ) : (
        <section className="section-card">
          {config.sections.length ? <DynamicForm config={config} preview /> : <p>No project design is available.</p>}
        </section>
      )}
      <ConfirmDialog
        isOpen={!!action}
        title={action === 'load' ? 'Load template' : 'Publish eCRF'}
        message={action === 'load' ? 'Replace the project draft with a copy of this template?' : 'Publish this design for new participant records?'}
        confirmLabel={action === 'load' ? 'Load template' : 'Publish'}
        onCancel={() => setAction(undefined)}
        onConfirm={() => { if (action === 'load') void transferTemplate(); else if (action === 'publish') persist(true); setAction(undefined); }}
      />
    </div>
  );
}

export function ProjectEcrfPage() {
  const { projectId } = useParams();
  const project = useProjectsStore((state) => state.projects.find((item) => item.id === projectId));
  return project ? <ProjectEcrfEditor key={project.id} project={project} /> : null;
}

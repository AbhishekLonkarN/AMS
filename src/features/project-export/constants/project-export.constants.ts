export const PROJECT_EXPORT_LABELS = {
  title: 'Project Database - Export',
  description: 'All projects created by sponsors. Export a project to download its database.',
  searchPlaceholder: 'Search project, product, sponsor…',
  emptyTitle: 'No projects yet',
  emptyDescription: 'Projects created by sponsors will appear here.',
  itemLabel: 'projects',
  exportButton: 'Export',
  exportAria: (name: string) => `Export project ${name}`,
  exported: (name: string) => `Project ${name} has been exported.`,
} as const;

export const PROJECT_EXPORT_COLUMN_LABELS = {
  name: 'Project Name',
  testProduct: 'Test Product',
  description: 'Project Description',
  sponsor: 'Sponsor',
  projectManager: 'Project Manager',
  action: 'Action',
} as const;

/** Headings of the sections inside a project export file. */
export const PROJECT_EXPORT_SECTIONS = {
  project: 'Project details',
  sites: 'Sites',
} as const;

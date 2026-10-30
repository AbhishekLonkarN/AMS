export const SPONSOR_USER_LABELS = {
  listTitle: 'Sponsor User Management',
  listDescription: (project: string) => `Sponsor staff affiliated to ${project} and their project access rights.`,
  affiliateButton: 'Affiliate Sponsor User to this Project',
  affiliateTitle: 'Affiliate Sponsor User to this Project',
  editTitle: 'Edit Sponsor User of this Project',
  viewDescription: (project: string) => `Affiliation to ${project} and effective project access rights.`,
  matrixTitle: 'Project access rights (Sponsor)',
  detailsSection: 'Affiliation',
  searchPlaceholder: 'Search name, email, designation…',
} as const;

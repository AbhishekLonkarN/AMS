export const CO_USER_LABELS = {
  listTitle: 'CO User Management',
  listDescription: (site: string) => `CRO / clinical-operations staff affiliated to site ${site} and their site access rights.`,
  affiliateButton: 'Affiliate CO User to this Site',
  affiliateTitle: 'Affiliate CO User to this Site',
  editTitle: 'Edit CO User of this Site',
  viewDescription: (site: string) => `Affiliation to site ${site} and effective site access rights.`,
  matrixTitle: 'Site access rights (CO)',
  detailsSection: 'Affiliation',
  searchPlaceholder: 'Search name, email, designation…',
} as const;

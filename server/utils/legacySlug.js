// Old URLs/slugs carried the "e27" bulb-base label (e27-wall-lamp, lh-...-e27-pendant).
// Map them to the current slugs so bookmarked and shared links keep working.
export const normalizeLegacySlug = (value) => {
  if (typeof value !== 'string' || !value.includes('e27')) return value;
  return value
    .replace(/e27-(wall|hanging)-lamp/g, 'classic-$1-lamp')
    .replace(/(^|[-/])e27-/g, '$1')
    .replace(/-e27(?=$|[-/?&#])/g, '');
};

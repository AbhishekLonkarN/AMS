/** Normalises text for uniqueness checks: trimmed, case-insensitive. */
export const normalizeText = (value: string | undefined | null) => (value ?? '').trim().toLowerCase();

export const isSameText = (a: string | undefined | null, b: string | undefined | null) =>
  normalizeText(a) === normalizeText(b);

export const fullName = (prefix: string | undefined, name: string) => [prefix, name].filter(Boolean).join(' ');

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((part) => part && !part.endsWith('.'))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

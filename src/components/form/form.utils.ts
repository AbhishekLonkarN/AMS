import { FORM_LABELS } from './form.constants';

/**
 * Hint text for a required text field that was not given its own placeholder:
 * "Name" gives "Enter name", "Email ID (User ID)" gives "Enter email ID", "CIP No" gives "Enter CIP No".
 */
export function requiredPlaceholder(label: string): string {
  const text = label.replace(/\s*\(.*?\)\s*$/, '').trim();
  // keep acronyms and codes as written: only a normal capitalised word is lowercased
  const isCapitalisedWord = /^[A-Z][a-z]/.test(text);
  const phrase = isCapitalisedWord ? text.charAt(0).toLowerCase() + text.slice(1) : text;
  return `${FORM_LABELS.enterPrefix} ${phrase}`;
}

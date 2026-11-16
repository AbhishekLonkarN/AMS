import { PASSWORD_RULES, PASSWORD_STRENGTH_LABELS } from '../constants/auth.constants';

export interface PasswordRuleResult {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordCheck {
  rules: PasswordRuleResult[];
  /** Rules met, 0 to 4. Drives the strength meter. */
  score: number;
  label: string;
  isValid: boolean;
}

/** Checks a new password against every rule; the password is used exactly as typed (no trimming). */
export function checkNewPassword(password: string): PasswordCheck {
  const rules = PASSWORD_RULES.map((rule) => ({ id: rule.id, label: rule.label, met: rule.test(password) }));
  const score = rules.filter((rule) => rule.met).length;
  return { rules, score, label: PASSWORD_STRENGTH_LABELS[score], isValid: score === rules.length };
}

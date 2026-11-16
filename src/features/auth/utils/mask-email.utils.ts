/** "abcd.pqrs@amsltd.com" becomes "a*****@amsltd.com", so the page confirms where the link went without exposing the address. */
export function maskEmail(email: string): string {
  const [name = '', domain = ''] = email.trim().split('@');
  if (!domain) {return email;}
  return `${name.charAt(0)}*****@${domain}`;
}

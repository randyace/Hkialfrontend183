/**
 * Avatar circle initials for member sidebar / profile cards.
 *
 * Prefer first_name + last_name. When falling back to a display name,
 * strip common English honorifics so "Mr. King Tse" → "KT" (not "MK").
 */

const HONORIFIC_RE =
  /^(mr|mrs|ms|miss|dr|prof)\.?$/i;

function firstLetter(token: string): string {
  const ch = token.trim().charAt(0);
  return ch ? ch.toUpperCase() : '';
}

function stripHonorifics(tokens: string[]): string[] {
  return tokens.filter((token) => !HONORIFIC_RE.test(token.replace(/,$/, '')));
}

export function getMemberAvatarInitials(input: {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
}): string {
  const firstName = String(input.firstName ?? '').trim();
  const lastName = String(input.lastName ?? '').trim();

  if (firstName || lastName) {
    if (firstName && lastName) {
      return `${firstLetter(firstName)}${firstLetter(lastName)}`;
    }
    const sole = firstName || lastName;
    return sole.slice(0, 2).toUpperCase();
  }

  const tokens = stripHonorifics(
    String(input.name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean),
  );

  if (tokens.length === 0) return '';
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();

  // First name + surname (last token), matching Western display order.
  return `${firstLetter(tokens[0])}${firstLetter(tokens[tokens.length - 1])}`;
}

// Matches 0[17]XXXXXXXX (10 digits) or 254XXXXXXXXX (12 digits).
// The backend's normalizePhoneNumber.ts handles the 07XXXXXXXX → 2547XXXXXXXX
// conversion — send the raw digits the user typed, don't normalize here.
export function isValidKenyanPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return /^0[17]\d{8}$/.test(digits) || /^254\d{9}$/.test(digits);
}

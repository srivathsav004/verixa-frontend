// Shared IST date utilities
// Robustly handle timestamps with or without timezone.

export function formatIST(ts: string | Date): string {
  try {
    const date = toDate(ts);
    return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  } catch {
    return String(ts);
  }
}

export function formatISTDate(ts: string | Date): string {
  try {
    const date = toDate(ts);
    return date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
  } catch {
    return String(ts);
  }
}

function toDate(ts: string | Date): Date {
  if (ts instanceof Date) return ts;
  const s = String(ts).trim();
  // Detect timezone info at end: Z, z, or ±HH[:?]MM
  const hasTZ = /([zZ]|[+-]\d{2}:?\d{2})$/.test(s);
  // Normalize space to 'T' for ISO-like strings
  const isoLike = s.includes("T") ? s : s.replace(" ", "T");
  return new Date(hasTZ ? isoLike : isoLike + "Z");
}

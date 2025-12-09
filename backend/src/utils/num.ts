export const normalizePhone = (phone: string) => {
  let normalized = phone.trim();

  if (normalized.startsWith("00")) {
    normalized = "+" + normalized.slice(2);
  }

  if (!normalized.startsWith("+")) {
    normalized = "+" + normalized;
  }

  return normalized;
};

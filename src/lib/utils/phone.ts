export const ETHIOPIAN_PHONE_REGEX = /^(\+251|0)?[97]\d{8}$/;
export function isValidEthiopianPhone(phone: string): boolean {
  return ETHIOPIAN_PHONE_REGEX.test(phone);
}

export function normalizeEthiopianPhone(phone: string): string | null {
  if (!phone) return null;

  const cleaned = phone.replace(/\s+/g, "");

  if (cleaned.startsWith("+251")) {
    return cleaned;
  }

  if (cleaned.startsWith("0")) {
    return "+251" + cleaned.substring(1);
  }

  if (/^[97]\d{8}$/.test(cleaned)) {
    return "+251" + cleaned;
  }

  return null;
}

export function formatEthiopianPhone(
  phone: string,
  format: "international" | "local" = "local"
): string {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized) return phone;

  if (format === "international") {
    const digits = normalized.substring(4);
    return `+251 ${digits[0]} ${digits.substring(1, 3)} ${digits.substring(
      3,
      6
    )} ${digits.substring(6)}`;
  }

  const digits = normalized.substring(4);
  return `0${digits[0]} ${digits.substring(1, 3)} ${digits.substring(
    3,
    6
  )} ${digits.substring(6)}`;
}

export function getCountryCode(phone: string): string {
  if (phone.startsWith("+251")) return "+251";
  return "+251";
}

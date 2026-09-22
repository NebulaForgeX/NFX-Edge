/**
 * Namecheap TTL — dashboard "Automatic" is 1800 on setHosts and often 1799 on getHosts.
 * Wire values are seconds; labels show the unit.
 */
export const NAMECHEAP_AUTOMATIC_TTL = "1800";

export const NAMECHEAP_TTL_PRESET_VALUES = ["1800", "60", "300", "600", "1200", "3600", "7200", "14400", "86400"] as const;

export function isNamecheapAutomaticTtl(ttl: string | undefined): boolean {
  const value = (ttl ?? "").trim();
  return value === "" || value === "1799" || value === "1800";
}

export function namecheapTtlSelectValue(ttl: string | undefined): string {
  if (isNamecheapAutomaticTtl(ttl)) return NAMECHEAP_AUTOMATIC_TTL;
  const value = (ttl ?? "").trim();
  return value || NAMECHEAP_AUTOMATIC_TTL;
}

function ttlSecondsLabel(value: string): string {
  return /^\d+$/.test(value) ? `${value} s` : value;
}

export function namecheapTtlOptions(automaticLabel: string, current?: string): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = NAMECHEAP_TTL_PRESET_VALUES.map((value) => ({
    value,
    label: value === NAMECHEAP_AUTOMATIC_TTL ? automaticLabel : ttlSecondsLabel(value),
  }));
  const extra = (current ?? "").trim();
  if (extra && extra !== "1799" && !options.some((option) => option.value === extra)) {
    options.push({ value: extra, label: ttlSecondsLabel(extra) });
  }
  return options;
}

export function formatNamecheapTtl(ttl: string | undefined, automaticLabel: string): string {
  if (isNamecheapAutomaticTtl(ttl)) return automaticLabel;
  const value = (ttl ?? "").trim();
  return value ? ttlSecondsLabel(value) : "—";
}

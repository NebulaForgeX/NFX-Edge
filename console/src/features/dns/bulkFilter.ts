export const NAMECHEAP_BULK_FILTER_ALL = "all";
export const NAMECHEAP_BULK_PATCH_KEEP = "keep";

export function isNamecheapBulkFilterAll(value: string): boolean {
  const next = value.trim().toLowerCase();
  return next === "" || next === NAMECHEAP_BULK_FILTER_ALL;
}

export function isNamecheapBulkPatchKeep(value: string): boolean {
  const next = value.trim().toLowerCase();
  return next === "" || next === NAMECHEAP_BULK_PATCH_KEEP;
}

export function isNamecheapFlag(value: string | undefined): boolean {
  const next = (value ?? "").toLowerCase();
  return next === "true" || next === "yes";
}

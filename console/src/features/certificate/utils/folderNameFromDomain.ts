export function folderNameFromDomain(domain: string): string {
  const label = domain.trim().toLowerCase().replace(/\.+$/, "").split(".")[0] ?? "";
  return label.replace(/[^a-zA-Z0-9_-]/g, "");
}

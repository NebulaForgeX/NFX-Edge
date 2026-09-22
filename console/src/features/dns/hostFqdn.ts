export function normalizeApex(apex: string): string {
  return apex.trim().replace(/^\.+/, "").replace(/\.+$/, "").toLowerCase();
}

export function hostToFqdn(hostName: string, apex: string): string {
  const root = normalizeApex(apex);
  const label = hostName.trim().replace(/\.+$/, "");
  if (!root) return label.toLowerCase();
  if (!label || label === "@") return root;
  const lower = label.toLowerCase();
  if (lower === root || lower.endsWith(`.${root}`)) return lower;
  return `${lower}.${root}`;
}

export function uniqueFqdns(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const fqdn = value.trim().toLowerCase();
    if (!fqdn || seen.has(fqdn)) continue;
    seen.add(fqdn);
    out.push(fqdn);
  }
  return out;
}

export function hostsToSans(hosts: { name: string }[], apex: string): string[] {
  const cn = normalizeApex(apex);
  return uniqueFqdns(hosts.map((host) => hostToFqdn(host.name, cn))).filter((fqdn) => fqdn !== cn);
}

import { ROUTES } from "@/navigations";

export function buildCertAddPath(options: { domain: string; sans?: string[]; credentialId?: string }): string {
  const params = new URLSearchParams();
  params.set("domain", options.domain);
  if (options.sans?.length) params.set("sans", options.sans.join(","));
  if (options.credentialId) params.set("credentialId", options.credentialId);
  return `${ROUTES.CERT_ADD}?${params.toString()}`;
}

/*
 * API path tree: base paths + dynamic segments via path()（与 nfx-ui/apis、Pqttec-Admin 一致）
 */
import { path } from "nfx-ui/apis";
import { safeOr } from "nfx-ui/utils";

/** Vite `import.meta.env` 为 `unknown`，与 `safeOr` 组合后需收窄为 `string` */
const HTTP_BASE_URL: string = safeOr(import.meta.env.VITE_API_URL as string | undefined | null, "/nfx-edge");
const WS_BASE_URL: string = safeOr(import.meta.env.VITE_WS_URL as string | undefined | null, "");
const IMAGE_BASE_URL: string = safeOr(import.meta.env.VITE_IMAGE_URL as string | undefined | null, "");

export const URL_PATHS = {
  TLS: path("/edge/tls", {
    check: "/check",
    detailById: (certificateId: string) => `/detail-by-id/${certificateId}`,
    apply: "/apply",
    reapply: "/reapply",
    create: "/create",
    updateManualAdd: "/update/manual-add",
    delete: "/delete",
    invalidateCache: "/invalidate-cache",
    search: "/search",
    parsePreview: "/parse-preview",
    locales: (lang: string) => `/locales/${lang}`,
    messages: (lang: string) => `/messages/${lang}`,
  }),

  FILE: path("/edge/file", {
    list: "/list",
    export: "/export",
    exportSingle: "/export-single",
    download: "/download",
    content: "/content",
    delete: "/delete",
    locales: (lang: string) => `/locales/${lang}`,
    messages: (lang: string) => `/messages/${lang}`,
  }),

  ANALYSIS: path("/edge/analysis", {
    tls: "/tls",
    locales: (lang: string) => `/locales/${lang}`,
    messages: (lang: string) => `/messages/${lang}`,
  }),

  DNS: path("/edge/dns", {
    credentials: "/credentials",
    credential: (id: string) => `/credentials/${id}`,
    credentialVerify: (id: string) => `/credentials/${id}/verify`,
    credentialBalances: (id: string) => `/credentials/${id}/balances`,
    credentialDomains: (id: string) => `/credentials/${id}/domains`,
    credentialSsl: (id: string) => `/credentials/${id}/ssl`,
    credentialDomain: (id: string, domain: string) => `/credentials/${id}/domains/${encodeURIComponent(domain)}`,
    credentialHosts: (id: string) => `/credentials/${id}/hosts`,
    credentialHostsBulk: (id: string) => `/credentials/${id}/hosts/bulk`,
    credentialHostsBulkPreview: (id: string) => `/credentials/${id}/hosts/bulk/preview`,
    outboundIp: "/outbound-ip",
    locales: (lang: string) => `/locales/${lang}`,
    messages: (lang: string) => `/messages/${lang}`,
  }),

} as const;

export const API_ENDPOINTS = {
  PURE: HTTP_BASE_URL,
  WS: WS_BASE_URL,
  IMAGE: IMAGE_BASE_URL,
} as const;

export type URL_PATHS_TYPE = typeof URL_PATHS;
export type API_ENDPOINTS_TYPE = typeof API_ENDPOINTS;

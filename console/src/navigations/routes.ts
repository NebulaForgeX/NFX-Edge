import { createRouter, defineRouter } from "@/utils";

const routeMap = defineRouter({
  HOME: "/",
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",

  USER: "/user",
  USER_OVERVIEW: "/user/overview",
  PROFILE: "/user/profile",
  USER_PROFILE_OVERVIEW: "/user/profile/overview",
  USER_PROFILE_EDIT: "/user/profile/edit",
  USER_PROFILE_IDENTITIES: "/user/profile/identities",
  USER_SETTINGS: "/user/settings",

  CERTS: "/certs",
  CERTS_OVERVIEW: "/certs/overview",
  CERT_ADD: "/certs/add",
  CERT_DETAIL: "/certs/:certificateId",
  CERT_EDIT: "/certs/:certificateId/edit",
  ANALYSIS_TLS: "/analysis/tls",
  FILE_FOLDER: "/filefolder",

  NAMECHEAP: "/namecheap",
  NAMECHEAP_OVERVIEW: "/namecheap/overview",
  NAMECHEAP_NEW: "/namecheap/new",
  NAMECHEAP_DETAIL: "/namecheap/:credentialId",
  NAMECHEAP_EDIT: "/namecheap/:credentialId/edit",
  NAMECHEAP_DOMAINS: "/namecheap/:credentialId/domains",
  NAMECHEAP_DOMAINS_BULK: "/namecheap/:credentialId/domains/bulk",
  NAMECHEAP_DOMAIN: "/namecheap/:credentialId/domains/:domain",
  NAMECHEAP_SSL: "/namecheap/:credentialId/ssl",
});

const { ROUTES, matchRoute, isActiveRoute, buildPath } = createRouter(routeMap);

export type RouteKey = keyof typeof ROUTES;
export { ROUTES, matchRoute, isActiveRoute, buildPath };

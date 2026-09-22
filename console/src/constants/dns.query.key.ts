import { createItemKey, createListKey } from "nfx-ui/constants";

import { DOMAIN_DNS, DOMAIN_DNS_CREDENTIAL, DOMAIN_DNS_DOMAIN } from "./domain.key";

export const DNS_CREDENTIAL_LIST = createListKey(DOMAIN_DNS, DOMAIN_DNS_CREDENTIAL);
export const DNS_CREDENTIAL = createItemKey(DOMAIN_DNS, DOMAIN_DNS_CREDENTIAL);
export const DNS_BALANCES = createItemKey(DOMAIN_DNS, "balances");
export const DNS_DOMAIN_LIST = createListKey(DOMAIN_DNS, DOMAIN_DNS_DOMAIN);
export const DNS_DOMAIN = createItemKey(DOMAIN_DNS, DOMAIN_DNS_DOMAIN);
export const DNS_SSL_LIST = createListKey(DOMAIN_DNS, "ssl");
export const DNS_OUTBOUND_IP = createItemKey(DOMAIN_DNS, "outbound-ip");
export const DNS_DOMAIN_LOOKUP = createItemKey(DOMAIN_DNS, "domain-lookup");

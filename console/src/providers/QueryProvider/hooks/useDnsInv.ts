import type { QueryKey } from "@tanstack/react-query";

import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

import { DNS_BALANCES, DNS_CREDENTIAL, DNS_CREDENTIAL_LIST, DNS_DOMAIN, DNS_DOMAIN_LIST, DNS_DOMAIN_LOOKUP, DNS_OUTBOUND_IP, DNS_SSL_LIST } from "@/constants";
import { dnsEventEmitter, dnsEvents } from "@/events/dns";

export const useDnsInv = (queryClient: QueryClient) => {
  useEffect(() => {
    const onInvalidate = (detailQueryKey?: QueryKey) => {
      queryClient.invalidateQueries({ queryKey: DNS_CREDENTIAL_LIST.getPrefix, exact: false });
      queryClient.invalidateQueries({ queryKey: DNS_CREDENTIAL.getPrefix, exact: false });
      queryClient.invalidateQueries({ queryKey: DNS_BALANCES.getPrefix, exact: false });
      queryClient.invalidateQueries({ queryKey: DNS_DOMAIN_LIST.getPrefix, exact: false });
      queryClient.invalidateQueries({ queryKey: DNS_DOMAIN.getPrefix, exact: false });
      queryClient.invalidateQueries({ queryKey: DNS_SSL_LIST.getPrefix, exact: false });
      queryClient.invalidateQueries({ queryKey: DNS_OUTBOUND_IP.getPrefix, exact: false });
      queryClient.invalidateQueries({ queryKey: DNS_DOMAIN_LOOKUP.getPrefix, exact: false });
      if (detailQueryKey) {
        queryClient.invalidateQueries({ queryKey: detailQueryKey, exact: true });
      }
    };

    dnsEventEmitter.on(dnsEvents.INVALIDATE_DNS, onInvalidate);
    return () => {
      dnsEventEmitter.off(dnsEvents.INVALIDATE_DNS, onInvalidate);
    };
  }, [queryClient]);
};

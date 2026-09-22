import type { AxiosError } from "axios";
import type { NormalUnifiedQueryOptions } from "nfx-ui/hooks";
import type {
  BulkNamecheapHostRequest,
  DeleteNamecheapHostRequest,
  NamecheapBalances,
  NamecheapCredential,
  NamecheapDomain,
  NamecheapDomainDetail,
  NamecheapSslCertificate,
  WriteNamecheapCredentialRequest,
  WriteNamecheapHostRequest,
} from "@/types";

import { useMutation } from "@tanstack/react-query";
import { useUnifiedQuery } from "nfx-ui/hooks";
import { getApiErrorMessage } from "nfx-ui/utils";
import { showError, showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

import { useDnsRepository } from "@/apis/repositories";
import { DNS_BALANCES, DNS_CREDENTIAL, DNS_CREDENTIAL_LIST, DNS_DOMAIN, DNS_DOMAIN_LIST, DNS_DOMAIN_LOOKUP, DNS_OUTBOUND_IP, DNS_SSL_LIST } from "@/constants";
import { dnsEventEmitter } from "@/events/dns";

export const useNamecheapCredentials = (options?: NormalUnifiedQueryOptions<{ items: NamecheapCredential[] }>) => {
  const dns = useDnsRepository();
  return useUnifiedQuery(() => dns.ListNamecheapCredentials(), DNS_CREDENTIAL_LIST, {}, options);
};

export const useNamecheapCredential = (id: string, options?: NormalUnifiedQueryOptions<NamecheapCredential>) => {
  const dns = useDnsRepository();
  return useUnifiedQuery((p: { id: string }) => dns.GetNamecheapCredential(p.id), DNS_CREDENTIAL(id), { id }, { enabled: Boolean(id), ...options });
};

export const useNamecheapBalances = (id: string, options?: NormalUnifiedQueryOptions<NamecheapBalances>) => {
  const dns = useDnsRepository();
  return useUnifiedQuery((p: { id: string }) => dns.GetNamecheapBalances(p.id), DNS_BALANCES(id), { id }, { enabled: Boolean(id), ...options });
};

export const useDnsOutboundIp = (options?: NormalUnifiedQueryOptions<{ ipv4: string }>) => {
  const dns = useDnsRepository();
  return useUnifiedQuery(() => dns.GetDnsOutboundIp(), DNS_OUTBOUND_IP(), {}, options);
};

export const useNamecheapDomains = (id: string, options?: NormalUnifiedQueryOptions<{ items: NamecheapDomain[] }>) => {
  const dns = useDnsRepository();
  return useUnifiedQuery((p: { id: string }) => dns.ListNamecheapDomains(p.id), DNS_DOMAIN_LIST, { id }, { enabled: Boolean(id), ...options });
};

export const useNamecheapSsl = (id: string, options?: NormalUnifiedQueryOptions<{ items: NamecheapSslCertificate[] }>) => {
  const dns = useDnsRepository();
  return useUnifiedQuery((p: { id: string }) => dns.ListNamecheapSsl(p.id), DNS_SSL_LIST, { id }, { enabled: Boolean(id), ...options });
};

export const useNamecheapDomain = (id: string, domain: string, options?: NormalUnifiedQueryOptions<NamecheapDomainDetail>) => {
  const dns = useDnsRepository();
  return useUnifiedQuery(
    (p: { id: string; domain: string }) => dns.GetNamecheapDomain(p.id, p.domain),
    DNS_DOMAIN(`${id}:${domain}`),
    { id, domain },
    { enabled: Boolean(id && domain), ...options },
  );
};

export const useNamecheapDomainLookup = (apex: string, preferredCredentialId = "") => {
  const dns = useDnsRepository();
  const creds = useNamecheapCredentials();
  const normalized = apex.trim().toLowerCase();
  const hasCredentials = (creds.data?.items?.length ?? 0) > 0;
  const lookup = useUnifiedQuery(
    async (p: { apex: string; preferredCredentialId: string }) => {
      const list = await dns.ListNamecheapCredentials();
      const items = list.items ?? [];
      const ordered = p.preferredCredentialId
        ? [...items.filter((row) => row.id === p.preferredCredentialId), ...items.filter((row) => row.id !== p.preferredCredentialId)]
        : items;
      const candidates = [p.apex];
      const dot = p.apex.indexOf(".");
      if (dot > 0 && p.apex.slice(dot + 1).includes(".")) {
        candidates.push(p.apex.slice(dot + 1));
      }
      for (const cred of ordered) {
        const domains = await dns.ListNamecheapDomains(cred.id);
        const names = domains.items ?? [];
        let hit: (typeof names)[number] | undefined;
        for (const candidate of candidates) {
          hit = names.find((row) => row.name.toLowerCase() === candidate);
          if (hit) break;
        }
        if (!hit) continue;
        const detail = await dns.GetNamecheapDomain(cred.id, hit.name);
        return { credentialId: cred.id, detail };
      }
      return { credentialId: "", detail: null as NamecheapDomainDetail | null };
    },
    DNS_DOMAIN_LOOKUP(normalized),
    { apex: normalized, preferredCredentialId },
    { enabled: Boolean(normalized.includes(".")) && creds.isSuccess && hasCredentials },
  );
  return { creds, lookup, hasCredentials };
};

export const useCreateNamecheapCredential = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: (request: WriteNamecheapCredentialRequest) => dns.CreateNamecheapCredential(request),
    onSuccess: () => dnsEventEmitter.invalidateDns(),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useCreateNamecheapCredential]")),
  });
};

export const useUpdateNamecheapCredential = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: WriteNamecheapCredentialRequest }) => dns.UpdateNamecheapCredential(id, request),
    onSuccess: () => dnsEventEmitter.invalidateDns(),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useUpdateNamecheapCredential]")),
  });
};

export const useDeleteNamecheapCredential = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: (id: string) => dns.DeleteNamecheapCredential(id),
    onSuccess: (data) => {
      if (data.success) showSuccess(getCommandMessage(data.message));
      else showError(getCommandMessage(data.message));
      dnsEventEmitter.invalidateDns();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useDeleteNamecheapCredential]")),
  });
};

export const useVerifyNamecheapCredential = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: (id: string) => dns.VerifyNamecheapCredential(id),
    onSuccess: (data) => {
      if (data.success) showSuccess(getCommandMessage(data.message));
      else showError(getCommandMessage(data.message));
      dnsEventEmitter.invalidateDns();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useVerifyNamecheapCredential]")),
  });
};

export const useAddNamecheapHost = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: WriteNamecheapHostRequest }) => dns.AddNamecheapHost(id, request),
    onSuccess: (data) => {
      if (data.success) showSuccess(getCommandMessage(data.message));
      else showError(getCommandMessage(data.message));
      dnsEventEmitter.invalidateDns();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useAddNamecheapHost]")),
  });
};

export const useUpdateNamecheapHost = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: WriteNamecheapHostRequest }) => dns.UpdateNamecheapHost(id, request),
    onSuccess: (data) => {
      if (data.success) showSuccess(getCommandMessage(data.message));
      else showError(getCommandMessage(data.message));
      dnsEventEmitter.invalidateDns();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useUpdateNamecheapHost]")),
  });
};

export const useDeleteNamecheapHost = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: DeleteNamecheapHostRequest }) => dns.DeleteNamecheapHost(id, request),
    onSuccess: (data) => {
      if (data.success) showSuccess(getCommandMessage(data.message));
      else showError(getCommandMessage(data.message));
      dnsEventEmitter.invalidateDns();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useDeleteNamecheapHost]")),
  });
};

export const usePreviewNamecheapHosts = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: BulkNamecheapHostRequest }) => dns.PreviewNamecheapHosts(id, request),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[usePreviewNamecheapHosts]")),
  });
};

export const useBulkNamecheapHosts = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: BulkNamecheapHostRequest }) => dns.BulkNamecheapHosts(id, request),
    onSuccess: () => dnsEventEmitter.invalidateDns(),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useBulkNamecheapHosts]")),
  });
};

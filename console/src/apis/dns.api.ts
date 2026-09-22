import type {
  BulkNamecheapHostRequest,
  DeleteNamecheapHostRequest,
  DnsCommandResult,
  DnsOutboundIp,
  NamecheapBalances,
  NamecheapBulkHostResult,
  NamecheapCredential,
  NamecheapDomain,
  NamecheapDomainDetail,
  NamecheapSslCertificate,
  WriteNamecheapCredentialRequest,
  WriteNamecheapHostRequest,
} from "@/types";

import { protectedClient, publicClientWithoutTransform } from "@/apis/clients";
import { URL_PATHS } from "./ip";

interface Envelope<T> {
  status: number;
  message: string;
  data: T;
}

async function unwrap<T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> {
  const { data } = await promise;
  return data.data;
}

export const ListNamecheapCredentials = () =>
  unwrap<{ items: NamecheapCredential[] }>(protectedClient.get(URL_PATHS.DNS.credentials));

export const GetNamecheapCredential = (id: string) =>
  unwrap<NamecheapCredential>(protectedClient.get(URL_PATHS.DNS.credential(id)));

export const CreateNamecheapCredential = (request: WriteNamecheapCredentialRequest) =>
  unwrap<NamecheapCredential>(protectedClient.post(URL_PATHS.DNS.credentials, request));

export const UpdateNamecheapCredential = (id: string, request: WriteNamecheapCredentialRequest) =>
  unwrap<NamecheapCredential>(protectedClient.put(URL_PATHS.DNS.credential(id), request));

export const DeleteNamecheapCredential = (id: string) =>
  unwrap<DnsCommandResult>(protectedClient.delete(URL_PATHS.DNS.credential(id)));

export const VerifyNamecheapCredential = (id: string) =>
  unwrap<DnsCommandResult>(protectedClient.post(URL_PATHS.DNS.credentialVerify(id)));

export const GetNamecheapBalances = (id: string) =>
  unwrap<NamecheapBalances>(protectedClient.get(URL_PATHS.DNS.credentialBalances(id)));

export const ListNamecheapDomains = (id: string) =>
  unwrap<{ items: NamecheapDomain[] }>(protectedClient.get(URL_PATHS.DNS.credentialDomains(id)));

export const ListNamecheapSsl = (id: string) =>
  unwrap<{ items: NamecheapSslCertificate[] }>(protectedClient.get(URL_PATHS.DNS.credentialSsl(id)));

export const GetNamecheapDomain = (id: string, domain: string) =>
  unwrap<NamecheapDomainDetail>(protectedClient.get(URL_PATHS.DNS.credentialDomain(id, domain)));

export const AddNamecheapHost = (id: string, request: WriteNamecheapHostRequest) =>
  unwrap<DnsCommandResult>(protectedClient.post(URL_PATHS.DNS.credentialHosts(id), request));

export const UpdateNamecheapHost = (id: string, request: WriteNamecheapHostRequest) =>
  unwrap<DnsCommandResult>(protectedClient.patch(URL_PATHS.DNS.credentialHosts(id), request));

export const DeleteNamecheapHost = (id: string, request: DeleteNamecheapHostRequest) =>
  unwrap<DnsCommandResult>(protectedClient.delete(URL_PATHS.DNS.credentialHosts(id), { data: request }));

export const BulkNamecheapHosts = (id: string, request: BulkNamecheapHostRequest) =>
  unwrap<NamecheapBulkHostResult>(protectedClient.post(URL_PATHS.DNS.credentialHostsBulk(id), request));

export const PreviewNamecheapHosts = (id: string, request: BulkNamecheapHostRequest) =>
  unwrap<NamecheapBulkHostResult>(protectedClient.post(URL_PATHS.DNS.credentialHostsBulkPreview(id), request));

export const GetDnsOutboundIp = () => unwrap<DnsOutboundIp>(protectedClient.get(URL_PATHS.DNS.outboundIp));

export const GetErrorTranslations = async (lang: string): Promise<Record<string, unknown>> => {
  const { data } = await publicClientWithoutTransform.get<Record<string, unknown>>(URL_PATHS.DNS.locales(lang));
  return data;
};

export const GetMessageTranslations = async (lang: string): Promise<Record<string, unknown>> => {
  const { data } = await publicClientWithoutTransform.get<Record<string, unknown>>(URL_PATHS.DNS.messages(lang));
  return data;
};

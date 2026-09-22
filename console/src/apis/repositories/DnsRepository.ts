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

import {
  AddNamecheapHost,
  BulkNamecheapHosts,
  PreviewNamecheapHosts,
  CreateNamecheapCredential,
  DeleteNamecheapCredential,
  DeleteNamecheapHost,
  GetDnsOutboundIp,
  GetErrorTranslations,
  GetMessageTranslations,
  GetNamecheapBalances,
  GetNamecheapCredential,
  GetNamecheapDomain,
  ListNamecheapCredentials,
  ListNamecheapDomains,
  ListNamecheapSsl,
  UpdateNamecheapCredential,
  UpdateNamecheapHost,
  VerifyNamecheapCredential,
} from "@/apis/dns.api";

export interface DnsRepository {
  ListNamecheapCredentials(): Promise<{ items: NamecheapCredential[] }>;
  GetNamecheapCredential(id: string): Promise<NamecheapCredential>;
  CreateNamecheapCredential(request: WriteNamecheapCredentialRequest): Promise<NamecheapCredential>;
  UpdateNamecheapCredential(id: string, request: WriteNamecheapCredentialRequest): Promise<NamecheapCredential>;
  DeleteNamecheapCredential(id: string): Promise<DnsCommandResult>;
  VerifyNamecheapCredential(id: string): Promise<DnsCommandResult>;
  GetNamecheapBalances(id: string): Promise<NamecheapBalances>;
  ListNamecheapDomains(id: string): Promise<{ items: NamecheapDomain[] }>;
  ListNamecheapSsl(id: string): Promise<{ items: NamecheapSslCertificate[] }>;
  GetNamecheapDomain(id: string, domain: string): Promise<NamecheapDomainDetail>;
  AddNamecheapHost(id: string, request: WriteNamecheapHostRequest): Promise<DnsCommandResult>;
  UpdateNamecheapHost(id: string, request: WriteNamecheapHostRequest): Promise<DnsCommandResult>;
  DeleteNamecheapHost(id: string, request: DeleteNamecheapHostRequest): Promise<DnsCommandResult>;
  BulkNamecheapHosts(id: string, request: BulkNamecheapHostRequest): Promise<NamecheapBulkHostResult>;
  PreviewNamecheapHosts(id: string, request: BulkNamecheapHostRequest): Promise<NamecheapBulkHostResult>;
  GetDnsOutboundIp(): Promise<DnsOutboundIp>;
  GetErrorTranslations(lang: string): Promise<Record<string, unknown>>;
  GetMessageTranslations(lang: string): Promise<Record<string, unknown>>;
}

export class ApiDnsRepository implements DnsRepository {
  ListNamecheapCredentials = ListNamecheapCredentials;
  GetNamecheapCredential = GetNamecheapCredential;
  CreateNamecheapCredential = CreateNamecheapCredential;
  UpdateNamecheapCredential = UpdateNamecheapCredential;
  DeleteNamecheapCredential = DeleteNamecheapCredential;
  VerifyNamecheapCredential = VerifyNamecheapCredential;
  GetNamecheapBalances = GetNamecheapBalances;
  ListNamecheapDomains = ListNamecheapDomains;
  ListNamecheapSsl = ListNamecheapSsl;
  GetNamecheapDomain = GetNamecheapDomain;
  AddNamecheapHost = AddNamecheapHost;
  UpdateNamecheapHost = UpdateNamecheapHost;
  DeleteNamecheapHost = DeleteNamecheapHost;
  BulkNamecheapHosts = BulkNamecheapHosts;
  PreviewNamecheapHosts = PreviewNamecheapHosts;
  GetDnsOutboundIp = GetDnsOutboundIp;
  GetErrorTranslations = GetErrorTranslations;
  GetMessageTranslations = GetMessageTranslations;
}

/**
 * Namecheap domain types — camelCase after axios-case-converter.
 */

export interface NamecheapCredential {
  id: string;
  accountId: string;
  profileId?: string;
  label: string;
  apiUser: string;
  userName: string;
  clientIp: string;
  sandbox: boolean;
  hasApiKey: boolean;
  lastVerifiedAt?: string;
  lastErrorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NamecheapDomain {
  id: string;
  name: string;
  created?: string;
  expires?: string;
  isExpired?: string;
  isLocked?: string;
  autoRenew?: string;
  isOurDns?: string;
}

export interface NamecheapHost {
  hostId?: string;
  name: string;
  type: string;
  address: string;
  mxPref?: string;
  ttl?: string;
  associatedAppTitle?: string;
  friendlyName?: string;
  isActive?: string;
  isDdnsEnabled?: string;
}

export interface NamecheapHostsResult {
  domain: string;
  emailType?: string;
  isOurDns: boolean;
  hosts: NamecheapHost[];
}

export interface NamecheapDomainInfo {
  id: string;
  domain: string;
  status: string;
  created: string;
  expires: string;
  isExpired: string;
  isLocked: string;
  autoRenew: string;
  isOurDns: boolean;
  providerType: string;
  nameservers: string[];
}

export interface NamecheapDomainDetail {
  info: NamecheapDomainInfo;
  hosts: NamecheapHostsResult | null;
}

export interface NamecheapBalances {
  currency: string;
  availableBalance: string;
  accountBalance: string;
  earnedAmount: string;
  withdrawableAmount: string;
  fundsRequiredForAutoRenew: string;
}

export interface NamecheapSslCertificate {
  certificateId: string;
  hostName: string;
  sslType: string;
  purchaseDate: string;
  expireDate: string;
  activationExpireDate: string;
  isExpired: string;
  status: string;
}

export interface DnsCommandResult {
  success: boolean;
  message: string;
}

export interface DnsOutboundIp {
  ipv4: string;
}

export interface NamecheapBulkHostSnap {
  name: string;
  type: string;
  address: string;
  ttl?: string;
  mxPref?: string;
}

export interface NamecheapBulkHostChange {
  before?: NamecheapBulkHostSnap | null;
  after?: NamecheapBulkHostSnap | null;
}

export interface NamecheapBulkHostItem {
  domain: string;
  status: string;
  message?: string;
  changes?: NamecheapBulkHostChange[];
}

export interface NamecheapBulkHostResult {
  items: NamecheapBulkHostItem[];
}

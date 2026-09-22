export interface WriteNamecheapCredentialRequest {
  label?: string;
  apiUser: string;
  apiKey?: string;
  clientIp: string;
  sandbox?: boolean;
}

export interface WriteNamecheapHostRequest {
  domain: string;
  hostId?: string;
  name: string;
  type: string;
  address: string;
  ttl?: string;
  mxPref?: string;
}

export interface DeleteNamecheapHostRequest {
  domain: string;
  hostId?: string;
  name?: string;
  type?: string;
}

export interface BulkNamecheapHostMatch {
  ids?: string[];
  keys?: string[];
  name?: string;
  type?: string;
  address?: string;
  ttl?: string;
  mxPref?: string;
}

export interface BulkNamecheapHostPatch {
  address?: string;
  ttl?: string;
  mxPref?: string;
  addressSelf?: boolean;
}

export interface BulkNamecheapHostAdd {
  name: string;
  type: string;
  address?: string;
  ttl?: string;
  mxPref?: string;
  addressSelf?: boolean;
}

export interface BulkNamecheapHostRequest {
  action: string;
  domains: string[];
  filter?: BulkNamecheapHostMatch;
  patch?: BulkNamecheapHostPatch;
  adds?: BulkNamecheapHostAdd[];
}

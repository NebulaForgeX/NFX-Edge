/**
 * TLS 分析 API 返回结构 — 与 NFX-Edge Backend analysis 路由对齐。
 */

export interface AnalyzeTLSCertificateInfo {
  commonName: Nullable<string>;
  subject: Record<string, unknown>;
  issuer: Nullable<string>;
  sans?: string[];
  allDomains?: string[];
  notBefore: Nullable<string>;
  notAfter: Nullable<string>;
  isValid: boolean;
  daysRemaining: Nullable<number>;
}

export interface AnalyzeTLSPrivateKeyInfo {
  hasPrivateKey: boolean;
  valid?: boolean;
  error?: string;
}

export interface AnalyzeTLSSummary {
  isValid: boolean;
  daysRemaining: Nullable<number>;
  hasPrivateKey: boolean;
  keyValid: Nullable<boolean>;
}

export interface AnalyzeTLSResponse {
  success: boolean;
  message: string;
  data?: {
    certificate: AnalyzeTLSCertificateInfo;
    privateKey: AnalyzeTLSPrivateKeyInfo;
    summary: AnalyzeTLSSummary;
  };
}

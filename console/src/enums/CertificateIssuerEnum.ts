/**
 * ACME certificate issuer — apply currently only issues via Let's Encrypt (certbot).
 */
import type { Nilable } from "nfx-ui/types";

import { safeEnum } from "nfx-ui/utils";

export enum CertificateIssuerEnum {
  LETS_ENCRYPT = "Let's Encrypt",
}

export const DEFAULT_CERTIFICATE_ISSUER = CertificateIssuerEnum.LETS_ENCRYPT;
export const CERTIFICATE_ISSUER_VALUES = Object.values(CertificateIssuerEnum);
export const CertificateIssuer = (value: Nilable<string>) =>
  safeEnum(value, CERTIFICATE_ISSUER_VALUES, DEFAULT_CERTIFICATE_ISSUER);

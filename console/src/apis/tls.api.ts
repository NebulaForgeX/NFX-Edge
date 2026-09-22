import type {
  CertificateListResponse,
  CertificateDetailResponse,
  ApplyCertificateRequest,
  ReapplyCertificateRequest,
  CreateCertificateRequest,
  UpdateManualAddCertificateRequest,
  DeleteCertificateRequest,
  SearchCertificateRequest,
  CertificateResponse,
  SearchCertificateResponse,
  ParseCertificatePreviewRequest,
  ParseCertificatePreviewResponse,
} from "@/types";

import { protectedClient, publicClientWithoutTransform } from "@/apis/clients";
import { URL_PATHS } from "./ip";

/** 与后端 Certbot 最长等待（如 300s）对齐，并留余量，避免 nginx/浏览器先断连 */
export const TLS_ISSUE_HTTP_TIMEOUT_MS = 420_000;

interface Envelope<T> {
  status: number;
  message: string;
  data: T;
}

async function unwrap<T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> {
  const { data } = await promise;
  return data.data;
}

export interface GetCertificateListParams {
  offset?: number;
  limit?: number;
}

export const GetCertificateList = (params: GetCertificateListParams = {}): Promise<CertificateListResponse> => {
  const { offset = 0, limit = 20 } = params;
  return unwrap<CertificateListResponse>(
    protectedClient.get(URL_PATHS.TLS.check, {
      params: { offset, limit },
    }),
  );
};

export const GetCertificateDetailById = (
  certificateId: string,
  options?: { timeout?: number },
): Promise<CertificateDetailResponse> =>
  unwrap<CertificateDetailResponse>(
    protectedClient.get(URL_PATHS.TLS.detailById(certificateId), {
      timeout: options?.timeout ?? 30000,
    }),
  );

export const ApplyCertificate = (request: ApplyCertificateRequest): Promise<CertificateResponse> =>
  unwrap<CertificateResponse>(
    protectedClient.post(URL_PATHS.TLS.apply, request, {
      timeout: TLS_ISSUE_HTTP_TIMEOUT_MS,
    }),
  );

export const ReapplyCertificate = (request: ReapplyCertificateRequest): Promise<CertificateResponse> =>
  unwrap<CertificateResponse>(
    protectedClient.post(URL_PATHS.TLS.reapply, request, {
      timeout: TLS_ISSUE_HTTP_TIMEOUT_MS,
    }),
  );

export const CreateCertificate = (request: CreateCertificateRequest): Promise<CertificateResponse> =>
  unwrap<CertificateResponse>(protectedClient.post(URL_PATHS.TLS.create, request));

export const UpdateManualAddCertificate = (request: UpdateManualAddCertificateRequest): Promise<CertificateResponse> =>
  unwrap<CertificateResponse>(protectedClient.put(URL_PATHS.TLS.updateManualAdd, request));

export const DeleteCertificate = (request: DeleteCertificateRequest): Promise<CertificateResponse> =>
  unwrap<CertificateResponse>(
    protectedClient.delete(URL_PATHS.TLS.delete, {
      data: request,
    }),
  );

export interface InvalidateCacheResponse {
  success: boolean;
  message: string;
}

export const InvalidateCache = (): Promise<InvalidateCacheResponse> =>
  unwrap<InvalidateCacheResponse>(protectedClient.post(URL_PATHS.TLS.invalidateCache));

export const SearchCertificate = (request: SearchCertificateRequest): Promise<SearchCertificateResponse> =>
  unwrap<SearchCertificateResponse>(protectedClient.post(URL_PATHS.TLS.search, request));

export const ParseCertificatePreview = (request: ParseCertificatePreviewRequest): Promise<ParseCertificatePreviewResponse> =>
  unwrap<ParseCertificatePreviewResponse>(protectedClient.post(URL_PATHS.TLS.parsePreview, request));

export const GetErrorTranslations = async (lang: string): Promise<Record<string, unknown>> => {
  const { data } = await publicClientWithoutTransform.get<Record<string, unknown>>(URL_PATHS.TLS.locales(lang));
  return data;
};

export const GetMessageTranslations = async (lang: string): Promise<Record<string, unknown>> => {
  const { data } = await publicClientWithoutTransform.get<Record<string, unknown>>(URL_PATHS.TLS.messages(lang));
  return data;
};

import type { FileListResponse } from "@/types";
import { FileItemTypeEnum, FileStoreEnum } from "@/enums";
import { safeOr } from "nfx-ui/utils";
import { protectedClient, publicClientWithoutTransform } from "@/apis/clients";
import { URL_PATHS } from "./ip";
import { AuthStore } from "nfx-ui/stores";

interface Envelope<T> {
  status: number;
  message: string;
  data: T;
}

async function unwrap<T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> {
  const { data } = await promise;
  return data.data;
}

export const ListDirectory = (path?: string): Promise<FileListResponse> =>
  unwrap<FileListResponse>(
    protectedClient.get(URL_PATHS.FILE.list, {
      params: path ? { path } : undefined,
    }),
  );

export const ExportCertificates = (): Promise<{ success: boolean; message: string }> =>
  unwrap<{ success: boolean; message: string }>(protectedClient.post(URL_PATHS.FILE.export));

export interface ExportSingleCertificateParams {
  certificateId: string;
}

export interface ExportSingleCertificateResponse {
  success: boolean;
  message: string;
  store?: string;
  folderName?: string;
  domain?: string;
  certificateId?: string;
}

export const ExportSingleCertificate = (
  params: ExportSingleCertificateParams,
): Promise<ExportSingleCertificateResponse> =>
  unwrap<ExportSingleCertificateResponse>(protectedClient.post(URL_PATHS.FILE.exportSingle, params));

export const downloadFile = async (filePath: string, folderName: string): Promise<void> => {
  const baseURL = safeOr(protectedClient.defaults.baseURL, window.location.origin);
  const downloadUrl = `${baseURL}${URL_PATHS.FILE.download}?path=${encodeURIComponent(filePath)}`;
  const token = AuthStore.getState().accessToken;
  const res = await fetch(downloadUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const originalFileName: string = safeOr(filePath.split("/").pop(), "file");
  const downloadFileName = folderName ? `${folderName}_${originalFileName}` : originalFileName;
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.setAttribute("download", downloadFileName);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
};

export interface FileContentResponse {
  success: boolean;
  message: string;
  content?: string;
  filename?: string;
}

export const GetFileContent = (filePath: string): Promise<FileContentResponse> =>
  unwrap<FileContentResponse>(
    protectedClient.get(URL_PATHS.FILE.content, {
      params: { path: filePath },
    }),
  );

export interface DeleteFileOrFolderRequest {
  store: FileStoreEnum;
  path: string;
  itemType: FileItemTypeEnum;
}

export interface DeleteFileOrFolderResponse {
  success: boolean;
  message: string;
}

export const DeleteFileOrFolder = (request: DeleteFileOrFolderRequest): Promise<DeleteFileOrFolderResponse> =>
  unwrap<DeleteFileOrFolderResponse>(
    protectedClient.delete(URL_PATHS.FILE.delete, {
      data: request,
    }),
  );

export const GetErrorTranslations = async (lang: string): Promise<Record<string, unknown>> => {
  const { data } = await publicClientWithoutTransform.get<Record<string, unknown>>(URL_PATHS.FILE.locales(lang));
  return data;
};

export const GetMessageTranslations = async (lang: string): Promise<Record<string, unknown>> => {
  const { data } = await publicClientWithoutTransform.get<Record<string, unknown>>(URL_PATHS.FILE.messages(lang));
  return data;
};

import type { FileItem, FileListResponse } from "@/types";
import type { AxiosError } from "axios";
import type { DeleteFileOrFolderRequest } from "@/apis/repositories";
import type { NormalUnifiedQueryOptions } from "nfx-ui/hooks";

import { useMutation } from "@tanstack/react-query";
import { useUnifiedQuery } from "nfx-ui/hooks";
import { getApiErrorMessage } from "nfx-ui/utils";
import { showError } from "@/stores/modal";

import { useFileRepository } from "@/apis/repositories";
import { FILE_DIRECTORY } from "@/constants";
import { fileEventEmitter } from "@/events/file";

export const useDirectoryList = (path?: string, options?: NormalUnifiedQueryOptions<FileListResponse>) => {
  const file = useFileRepository();
  return useUnifiedQuery((p: { path?: string }) => file.ListDirectory(p.path), FILE_DIRECTORY, { path }, options);
};

export const useFetchFileContent = () => {
  const file = useFileRepository();
  return useMutation({
    mutationFn: (filePath: string) => file.GetFileContent(filePath),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useFetchFileContent]")),
  });
};

export const useDownloadFile = () => {
  const file = useFileRepository();
  return useMutation({
    mutationFn: ({ filePath, folderName }: { filePath: string; folderName: string }) => file.downloadFile(filePath, folderName),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useDownloadFile]")),
  });
};

export const useDeleteFileOrFolder = () => {
  const file = useFileRepository();
  return useMutation({
    mutationFn: (request: DeleteFileOrFolderRequest) => file.DeleteFileOrFolder(request),
    onSuccess: () => {
      fileEventEmitter.invalidateDirectory();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useDeleteFileOrFolder]")),
  });
};

export const useExportSingleCertificate = () => {
  const file = useFileRepository();
  return useMutation({
    mutationFn: (certificateId: string) => file.ExportSingleCertificate({ certificateId }),
    onSuccess: () => {
      fileEventEmitter.invalidateDirectory();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useExportSingleCertificate]")),
  });
};

export type { FileItem };

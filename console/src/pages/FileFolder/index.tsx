import { DownloadIcon, FileDescriptionIcon, StackIcon, TrashIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Flex, Link, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { PageHeader } from "@/components";
import { useSearchParams } from "react-router";
import type { Nilable } from "nfx-ui/types";
import { safeOr, safeStringable } from "nfx-ui/utils";
import type { FileItem } from "@/types";

import { FileItemTypeEnum, FileStoreEnum } from "@/enums";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import { useDeleteFileOrFolder, useDirectoryList, useDownloadFile, useExportCertificates } from "@/hooks";
import { ModalStore, showConfirm, showError, showSuccess } from "@/stores/modal";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage, getCommandMessage } from "@/utils";

import styles from "./s.module.css";

const STORE = FileStoreEnum.WEBSITES;

function formatSize(bytes: Nilable<number>): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

const FileFolderPage = memo(() => {
  const { t } = useTranslation("fileFolder");
  const [searchParams] = useSearchParams();
  const pathParam = safeStringable(searchParams.get("path"));
  const { data, isLoading, error: queryError } = useDirectoryList(pathParam || undefined);
  const deleteMutation = useDeleteFileOrFolder();
  const downloadMutation = useDownloadFile();
  const exportMutation = useExportCertificates();

  const items = Array.isArray(data?.items) ? data.items : [];
  const currentPath = data?.path ? data.path.split("/").filter(Boolean) : [];
  const error = queryError ? getApiErrorMessage(queryError, t("loadFailed")) : data && !data.success ? getCommandMessage(data.message, t("loadFailed")) : null;

  const goPath = (path: string) => {
    routerEventEmitter.navigate({
      to: `${ROUTES.FILE_FOLDER}${path ? `?path=${encodeURIComponent(path)}` : ""}`,
    });
  };

  const handleBack = () => {
    if (currentPath.length > 0) {
      goPath(currentPath.slice(0, -1).join("/"));
    } else {
      routerEventEmitter.navigateBack();
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "directory") {
      goPath(item.path);
    } else if (item.type === "file") {
      ModalStore.getState().showFileModal({
        isOpen: true,
        store: STORE,
        filePath: item.path,
        fileName: item.name,
        folderName: safeOr(item.path.split("/").slice(0, -1).pop(), ""),
      });
    }
  };

  const handleDownload = async (item: FileItem) => {
    if (item.type !== "file") return;
    try {
      const pathParts = item.path.split("/").filter(Boolean);
      pathParts.pop();
      await downloadMutation.mutateAsync({ filePath: item.path, folderName: pathParts.join("_") || "" });
    } catch (err) {
      console.error("Failed to download file:", err);
    }
  };

  const handleDelete = (item: FileItem) => {
    const itemType = item.type === "directory" ? FileItemTypeEnum.FOLDER : FileItemTypeEnum.FILE;
    const itemName = itemType === FileItemTypeEnum.FOLDER ? t("folder") : t("file");
    showConfirm({
      title: t("deleteTitle", { type: itemName }),
      message: t("deleteMessage", { type: itemName, name: item.name }),
      confirmText: t("delete"),
      cancelText: t("cancel"),
      onConfirm: async () => {
        try {
          const result = await deleteMutation.mutateAsync({ store: STORE, path: item.path, itemType });
          if (result.success) showSuccess(getCommandMessage(result.message, t("deleteSuccess", { type: itemName })));
          else showError(getCommandMessage(result.message, t("deleteFailed", { type: itemName })));
        } catch (err: unknown) {
          showError(getApiErrorMessage(err, t("deleteFailed", { type: itemName })));
        }
      },
    });
  };

  const handleExportAll = async () => {
    try {
      const result = await exportMutation.mutateAsync();
      if (result.success) showSuccess(getCommandMessage(result.message, t("exportSuccess")));
      else showError(getCommandMessage(result.message, t("exportFailed")));
    } catch (err: unknown) {
      showError(getApiErrorMessage(err, t("exportFailed")));
    }
  };

  return (
    <PageFrame>
      <PageHeader
        icon={StackIcon}
        index={t("index")}
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Flex gap="2">
            <Button variant="outline" onClick={() => void handleExportAll()} loading={exportMutation.isPending}>
              {t("exportAll")}
            </Button>
            <Button variant="ghost" onClick={handleBack}>
              {t("back")}
            </Button>
          </Flex>
        }
      />

      <nav className={styles.crumbs} aria-label={t("path")}>
        <Link href={ROUTES.FILE_FOLDER} onClick={(e) => { e.preventDefault(); goPath(""); }}>
          {t("root")}
        </Link>
        {currentPath.map((segment, i) => {
          const path = currentPath.slice(0, i + 1).join("/");
          return (
            <span key={path} className={styles.crumb}>
              <span className={styles.sep}>/</span>
              <Link href={`${ROUTES.FILE_FOLDER}?path=${encodeURIComponent(path)}`} onClick={(e) => { e.preventDefault(); goPath(path); }}>
                {segment}
              </Link>
            </span>
          );
        })}
      </nav>

      {isLoading ? (
        <div className={styles.empty}>{t("loading")}</div>
      ) : error ? (
        <div className={styles.empty}>{error}</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>{t("empty")}</div>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.path} className={styles.row}>
              <button type="button" className={styles.open} onClick={() => handleItemClick(item)}>
                <span className={styles.mark}>{item.type === "directory" ? <StackIcon size={16} /> : <FileDescriptionIcon size={16} />}</span>
                <span className={styles.name}>{item.name}</span>
                <Text size="1" color="gray" className={styles.kind}>
                  {item.type === "directory" ? t("folder") : t("file")}
                </Text>
                <span className={styles.size}>{item.type === "file" ? formatSize(item.size) : "—"}</span>
                <span className={styles.date}>{formatDate(item.modified)}</span>
              </button>
              <Flex gap="2" className={styles.ops}>
                {item.type === "file" ? (
                  <Button size="1" variant="outline" onClick={() => void handleDownload(item)}>
                    <DownloadIcon size={14} />
                  </Button>
                ) : null}
                <Button size="1" variant="outline" color="red" onClick={() => handleDelete(item)}>
                  <TrashIcon size={14} />
                </Button>
              </Flex>
            </li>
          ))}
        </ul>
      )}
    </PageFrame>
  );
});

FileFolderPage.displayName = "FileFolderPage";

export default FileFolderPage;

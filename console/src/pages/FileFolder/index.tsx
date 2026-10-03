import { ArrowNarrowLeftIcon, DownloadIcon, FileDescriptionIcon, StackIcon, TrashIcon, TriangleAlertIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Badge, Button, Flex, Grid, IconButton, Link, Text, Tooltip } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { ActionBar, DataTable, EmptyState, PageHeader, StatCard } from "@/components";
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
  const folderCount = items.filter((item) => item.type === "directory").length;
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

  const backButton = (
    <Button variant="outline" color="gray" onClick={handleBack}>
      <ArrowNarrowLeftIcon size={16} />
      {t("back")}
    </Button>
  );

  return (
    <PageFrame>
      <PageHeader
        icon={StackIcon}
        index={t("index")}
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button variant="outline" color="gray" onClick={() => void handleExportAll()} loading={exportMutation.isPending}>
            <DownloadIcon size={16} />
            {t("exportAll")}
          </Button>
        }
      />
      <ActionBar
        status={
          <Flex asChild align="center" gap="1" wrap="wrap" minWidth="0">
            <nav aria-label={t("path")}>
              <Link
                size="2"
                weight="medium"
                href={ROUTES.FILE_FOLDER}
                className={styles.crumb}
                onClick={(e) => {
                  e.preventDefault();
                  goPath("");
                }}
              >
                {t("root")}
              </Link>
              {currentPath.map((segment, i) => {
                const path = currentPath.slice(0, i + 1).join("/");
                const last = i === currentPath.length - 1;
                return (
                  <Flex key={path} align="center" gap="1">
                    <Text size="2" color="gray">
                      /
                    </Text>
                    <Link
                      size="2"
                      weight={last ? "bold" : "medium"}
                      color={last ? "gray" : undefined}
                      highContrast={last}
                      href={`${ROUTES.FILE_FOLDER}?path=${encodeURIComponent(path)}`}
                      className={styles.crumb}
                      onClick={(e) => {
                        e.preventDefault();
                        goPath(path);
                      }}
                    >
                      {segment}
                    </Link>
                  </Flex>
                );
              })}
            </nav>
          </Flex>
        }
      >
        {backButton}
      </ActionBar>
      <Grid columns={{ initial: "1", sm: "2" }} gap="4">
        <StatCard icon={StackIcon} label={t("folders")} value={folderCount} tone="accent" />
        <StatCard icon={FileDescriptionIcon} label={t("files")} value={items.length - folderCount} tone="gray" />
      </Grid>
      {error ? (
        <EmptyState icon={TriangleAlertIcon} title={error} action={backButton} />
      ) : (
        <DataTable
          emptyIcon={StackIcon}
          empty={t("empty")}
          emptyAction={backButton}
          loading={isLoading}
          rows={items}
          rowKey={(item) => item.path}
          onRowClick={handleItemClick}
          columns={[
            {
              key: "name",
              header: t("colName"),
              render: (item) => (
                <Flex align="center" gap="3" minWidth="0">
                  <Flex align="center" justify="center" flexShrink="0" className={styles.mark} data-kind={item.type}>
                    {item.type === "directory" ? <StackIcon size={14} /> : <FileDescriptionIcon size={14} />}
                  </Flex>
                  <Text size="2" weight="medium" truncate>
                    {item.name}
                  </Text>
                </Flex>
              ),
            },
            {
              key: "type",
              header: t("colType"),
              render: (item) => (
                <Badge variant="surface" radius="full" color={item.type === "directory" ? undefined : "gray"}>
                  {item.type === "directory" ? t("folder") : t("file")}
                </Badge>
              ),
            },
            { key: "size", header: t("colSize"), mono: true, render: (item) => (item.type === "file" ? formatSize(item.size) : "—") },
            { key: "modified", header: t("colModified"), mono: true, render: (item) => formatDate(item.modified) },
            {
              key: "actions",
              header: t("colActions"),
              render: (item) => (
                <Flex gap="1" onClick={(e) => e.stopPropagation()}>
                  {item.type === "file" ? (
                    <Tooltip content={t("download")}>
                      <IconButton size="1" variant="ghost" color="gray" aria-label={t("download")} onClick={() => void handleDownload(item)}>
                        <DownloadIcon size={14} />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  <Tooltip content={t("delete")}>
                    <IconButton size="1" variant="ghost" color="red" aria-label={t("delete")} onClick={() => handleDelete(item)}>
                      <TrashIcon size={14} />
                    </IconButton>
                  </Tooltip>
                </Flex>
              ),
            },
          ]}
        />
      )}
    </PageFrame>
  );
});

FileFolderPage.displayName = "FileFolderPage";

export default FileFolderPage;

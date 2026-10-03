import { DownloadIcon, FileDescriptionIcon, XIcon } from "nfx-ui/icons";
import { memo, useEffect, useState } from "react";
import { Button, Callout, Container, Dialog, Flex, IconButton, Inset, ScrollArea, Section, Separator, Skeleton, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "nfx-ui/utils";

import { useDownloadFile, useFetchFileContent } from "@/hooks/file";
import ModalStore, { useModalStore } from "@/stores/modal";

import styles from "./s.module.css";

const FileModal = memo(() => {
  const { t } = useTranslation("modal");
  const isOpen = useModalStore((state) => state.fileModal.isOpen);
  const filePath = useModalStore((state) => state.fileModal.filePath);
  const fileName = useModalStore((state) => state.fileModal.fileName);
  const fetchContent = useFetchFileContent();
  const downloadMutation = useDownloadFile();
  const mutateContent = fetchContent.mutateAsync;

  const [fileContent, setFileContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFileContent("");
      setError(null);
      return;
    }
    if (!filePath) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void mutateContent(filePath)
      .then((result) => {
        if (cancelled) return;
        if (result.success && result.content) {
          setFileContent(result.content);
        } else {
          setError(result.message || t("file.loadFailed"));
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(getApiErrorMessage(err as never, t("file.loadFailed")));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, filePath, mutateContent, t]);

  const handleClose = () => {
    ModalStore.getState().hideModal("file");
  };

  const handleDownload = async () => {
    if (!filePath) return;
    const pathParts = filePath.split("/").filter(Boolean);
    pathParts.pop();
    await downloadMutation.mutateAsync({ filePath, folderName: pathParts.join("_") });
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Dialog.Content size="3" maxWidth="50rem">
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between" gap="3">
            <Flex align="center" gap="3" minWidth="0">
              <Flex align="center" justify="center" flexShrink="0" className={styles.stamp}>
                <FileDescriptionIcon size={20} />
              </Flex>
              <Flex direction="column" gap="1" minWidth="0">
                <Dialog.Title mb="0" size="4" truncate>
                  {fileName || t("file.title")}
                </Dialog.Title>
                <Dialog.Description size="1" color="gray" truncate className={styles.path}>
                  {filePath}
                </Dialog.Description>
              </Flex>
            </Flex>
            <Flex align="center" gap="2" flexShrink="0">
              <Button type="button" variant="outline" color="gray" disabled={loading || Boolean(error)} loading={downloadMutation.isPending} onClick={() => void handleDownload()}>
                <DownloadIcon size={16} />
                {t("file.download")}
              </Button>
              <Dialog.Close>
                <IconButton type="button" variant="ghost" color="gray" aria-label={t("file.close")}>
                  <XIcon size={18} />
                </IconButton>
              </Dialog.Close>
            </Flex>
          </Flex>
          <Inset side="x" clip="padding-box">
            <Separator size="4" />
          </Inset>
          {loading ? (
            <Flex direction="column" gap="2">
              <Skeleton height="1rem" width="70%" />
              <Skeleton height="1rem" width="90%" />
              <Skeleton height="1rem" width="55%" />
              <Skeleton height="1rem" width="80%" />
            </Flex>
          ) : error ? (
            <Callout.Root color="red" variant="surface">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          ) : (
            <ScrollArea type="auto" className={styles.sheet}>
              <Section size="1" py="4">
                <Container size="4" px="4">
                  <Text as="div" size="1" className={styles.pem}>
                    {fileContent}
                  </Text>
                </Container>
              </Section>
            </ScrollArea>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
});

FileModal.displayName = "FileModal";

export default FileModal;

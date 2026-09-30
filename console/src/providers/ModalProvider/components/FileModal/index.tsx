import { DownloadIcon, XIcon } from "nfx-ui/icons";
import { memo, useEffect, useState } from "react";
import { Box, Button, Dialog, Flex, IconButton, Text } from "@radix-ui/themes";
import { getApiErrorMessage } from "nfx-ui/utils";

import { useDownloadFile, useFetchFileContent } from "@/hooks/file";
import ModalStore, { useModalStore } from "@/stores/modal";

import styles from "./s.module.css";

const FileModal = memo(() => {
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
          setError(result.message || "Failed to load file content");
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(getApiErrorMessage(err as never, "Failed to load file content"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, filePath, mutateContent]);

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
      <Dialog.Content maxWidth="50rem" style={{ padding: 0 }}>
        <Box className={styles.hairline}>
          <Box py="4">
            <Box px="5">
              <Flex align="center" justify="between" gap="3">
                <Dialog.Title mb="0">{fileName || "File"}</Dialog.Title>
                <IconButton type="button" variant="ghost" aria-label="Close" onClick={handleClose}>
                  <XIcon size={18} />
                </IconButton>
              </Flex>
            </Box>
          </Box>
        </Box>
        <Box py="4">
          <Box px="4">
            {loading ? (
              <Text color="gray">Loading...</Text>
            ) : error ? (
              <Text color="red">{error}</Text>
            ) : (
              <Flex direction="column" gap="3">
                <Flex justify="end">
                  <Button type="button" variant="outline" onClick={() => void handleDownload()}>
                    <DownloadIcon size={16} />
                    Download
                  </Button>
                </Flex>
                <Box className={styles.hairline}>
                  <Box className={styles.fileContent}>
                    <pre className={styles.pre}>{fileContent}</pre>
                  </Box>
                </Box>
              </Flex>
            )}
          </Box>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
});

FileModal.displayName = "FileModal";

export default FileModal;

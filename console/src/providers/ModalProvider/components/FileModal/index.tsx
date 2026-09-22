import { DownloadIcon, XIcon } from "nfx-ui/icons";
import { memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components";
import { getApiErrorMessage } from "nfx-ui/utils";

import ModalStore, { useModalStore } from "@/stores/modal";
import { useDownloadFile, useFetchFileContent } from "@/hooks/file";
import styles from "./Modal.module.css";

const FileModal = memo(() => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = useModalStore((state) => state.fileModal.isOpen);
  const filePath = useModalStore((state) => state.fileModal.filePath);
  const fileName = useModalStore((state) => state.fileModal.fileName);
  const hideModal = ModalStore.getState().hideModal;
  const fetchContent = useFetchFileContent();
  const downloadMutation = useDownloadFile();
  const mutateContent = fetchContent.mutateAsync;

  const [fileContent, setFileContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      setFileContent("");
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !filePath) return;
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
    hideModal("file");
  };

  const handleDownload = async () => {
    if (!filePath) return;
    const pathParts = filePath.split("/").filter(Boolean);
    pathParts.pop();
    await downloadMutation.mutateAsync({ filePath, folderName: pathParts.join("_") });
  };

  if (!isOpen) return null;

  return (
    <dialog ref={dialogRef} className={styles.modal} onClose={handleClose}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>{fileName || "File"}</h3>
          </div>
          <Button type="button" variant="ghost" iconOnly leftIcon={<XIcon size={20} />} onClick={handleClose} className={styles.closeBtn} aria-label="Close" />
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <div className={styles.fileContentView}>
              <div className={styles.fileContentHeader}>
                <Button type="button" variant="outline" leftIcon={<DownloadIcon size={18} />} onClick={() => void handleDownload()} className={styles.downloadBtn} title="Download">
                  Download
                </Button>
              </div>
              <pre className={styles.fileContent}>{fileContent}</pre>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
});

FileModal.displayName = "FileModal";

export default FileModal;

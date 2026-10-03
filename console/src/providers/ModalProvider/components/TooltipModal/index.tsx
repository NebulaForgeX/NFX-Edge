import { TriangleAlertIcon, XIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Callout, Dialog, Flex, IconButton, Inset, Separator, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import ModalStore, { useModalStore } from "@/stores/modal";

import styles from "./s.module.css";

const TooltipModal = memo(() => {
  const { t } = useTranslation("certificateElements");
  const isOpen = useModalStore((state) => state.tooltipModal.isOpen);
  const message = useModalStore((state) => state.tooltipModal.message);
  const errorTime = useModalStore((state) => state.tooltipModal.errorTime);

  const handleClose = () => {
    ModalStore.getState().hideModal("tooltip");
  };

  return (
    <Dialog.Root
      open={Boolean(isOpen && message)}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Dialog.Content size="3" maxWidth="40rem" className={styles.shell}>
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between" gap="3">
            <Flex align="center" gap="3" minWidth="0">
              <Flex align="center" justify="center" flexShrink="0" className={styles.stamp}>
                <TriangleAlertIcon size={20} />
              </Flex>
              <Dialog.Title mb="0" size="4">
                {t("error.lastError") || "Last Error"}
              </Dialog.Title>
            </Flex>
            <IconButton type="button" variant="ghost" color="gray" aria-label={t("common.close") || "Close"} onClick={handleClose}>
              <XIcon size={18} />
            </IconButton>
          </Flex>
          <Inset side="x" clip="padding-box">
            <Separator size="4" />
          </Inset>
          <Callout.Root color="red" variant="surface">
            <Dialog.Description size="2">{message}</Dialog.Description>
          </Callout.Root>
          {errorTime ? (
            <Text size="1" color="gray" className={styles.time}>
              {t("error.errorTime") || "Error Time"}: {new Date(errorTime).toLocaleString()}
            </Text>
          ) : null}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
});

TooltipModal.displayName = "TooltipModal";

export default TooltipModal;

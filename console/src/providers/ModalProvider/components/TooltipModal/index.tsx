import { TriangleAlertIcon, XIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Box, Button, Dialog, Flex, Text } from "@radix-ui/themes";
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
      <Dialog.Content maxWidth="40rem" className={styles.shell}>
        <Flex direction="column" gap="3">
          <Flex align="center" justify="between" gap="3">
            <Flex align="center" gap="2" minWidth="0">
              <Text color="red">
                <TriangleAlertIcon size={20} />
              </Text>
              <Dialog.Title mb="0" size="2">
                {t("error.lastError") || "Last Error"}
              </Dialog.Title>
            </Flex>
            <Button type="button" variant="ghost" aria-label={t("common.close") || "Close"} onClick={handleClose}>
              <XIcon size={18} />
            </Button>
          </Flex>
          <Box className={styles.hairline} />
          <Dialog.Description size="2">{message}</Dialog.Description>
          {errorTime ? (
            <Text size="1" color="gray">
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

import { TriangleAlertIcon } from "nfx-ui/icons";
import { memo, useEffect, useState } from "react";
import { Button, Card, Dialog, Flex, Grid, Switch, Text, VisuallyHidden } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import ModalStore, { useModalStore } from "@/stores/modal";

import styles from "./s.module.css";

const ConfirmModal = memo(() => {
  const { t } = useTranslation("modal");
  const isOpen = useModalStore((state) => state.confirmModal.isOpen);
  const title = useModalStore((state) => state.confirmModal.title);
  const message = useModalStore((state) => state.confirmModal.message);
  const confirmText = useModalStore((state) => state.confirmModal.confirmText);
  const cancelText = useModalStore((state) => state.confirmModal.cancelText);
  const forceRenewalOption = useModalStore((state) => state.confirmModal.forceRenewalOption);
  const [forceRenewalChecked, setForceRenewalChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForceRenewalChecked(forceRenewalOption?.defaultChecked ?? false);
    }
  }, [isOpen, forceRenewalOption?.defaultChecked, forceRenewalOption?.label]);

  const handleClose = () => {
    ModalStore.getState().hideModal("confirm");
  };

  const handleConfirm = () => {
    const { onConfirm, forceRenewalOption: option } = ModalStore.getState().confirmModal;
    if (option) {
      onConfirm?.({ forceRenewal: forceRenewalChecked });
    } else {
      onConfirm?.();
    }
    handleClose();
  };

  const handleCancel = () => {
    ModalStore.getState().confirmModal.onCancel?.();
    handleClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <Dialog.Content size="3" maxWidth="28rem">
        <Flex direction="column" align="center" gap="4">
          <Flex align="center" justify="center" className={styles.stamp}>
            <TriangleAlertIcon size={24} />
          </Flex>
          {title ? (
            <Dialog.Title align="center" mb="0">
              {title}
            </Dialog.Title>
          ) : (
            <VisuallyHidden>
              <Dialog.Title>{t("confirm")}</Dialog.Title>
            </VisuallyHidden>
          )}
          <Dialog.Description size="2" color="gray" className={styles.message}>
            {message || t("noMessage")}
          </Dialog.Description>
          {forceRenewalOption ? (
            <Card size="1" variant="surface" className={styles.option}>
              <Text as="label" size="2">
                <Flex align="center" justify="between" gap="3">
                  <Text size="2">{forceRenewalOption.label}</Text>
                  <Switch checked={forceRenewalChecked} onCheckedChange={setForceRenewalChecked} />
                </Flex>
              </Text>
            </Card>
          ) : null}
          <Grid columns="2" gap="3" width="100%">
            <Button type="button" size="3" variant="outline" color="gray" onClick={handleCancel}>
              {cancelText || t("cancel")}
            </Button>
            <Button type="button" size="3" color="red" onClick={handleConfirm}>
              {confirmText || t("confirm")}
            </Button>
          </Grid>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
});

ConfirmModal.displayName = "ConfirmModal";

export default ConfirmModal;

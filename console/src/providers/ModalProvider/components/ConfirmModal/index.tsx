import { TriangleAlertIcon } from "nfx-ui/icons";
import { memo, useEffect, useState } from "react";
import { Button, Checkbox, Dialog, Flex, Text } from "@radix-ui/themes";
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
      <Dialog.Content maxWidth="28rem">
        <Flex direction="column" align="center" gap="4">
          <Text color="amber">
            <TriangleAlertIcon size={32} />
          </Text>
          {title ? <Dialog.Title align="center">{title}</Dialog.Title> : <Dialog.Title className={styles.srOnly}>{t("confirm")}</Dialog.Title>}
          <Dialog.Description size="2" color="gray" className={styles.message}>
            {message || t("noMessage")}
          </Dialog.Description>
          {forceRenewalOption ? (
            <Text as="label" size="2" color="gray">
              <Flex align="start" gap="2">
                <Checkbox checked={forceRenewalChecked} onCheckedChange={(checked) => setForceRenewalChecked(checked === true)} />
                <Text size="2">{forceRenewalOption.label}</Text>
              </Flex>
            </Text>
          ) : null}
          <Flex gap="3" justify="center" width="100%">
            <Button type="button" variant="outline" color="gray" onClick={handleCancel}>
              {cancelText || t("cancel")}
            </Button>
            <Button type="button" color="red" onClick={handleConfirm}>
              {confirmText || t("confirm")}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
});

ConfirmModal.displayName = "ConfirmModal";

export default ConfirmModal;

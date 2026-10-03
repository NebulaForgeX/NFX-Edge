import { CheckedIcon, InfoCircleIcon, XIcon, type AnimatedIconComponent } from "nfx-ui/icons";
import { Button, Dialog, Flex, ScrollArea, VisuallyHidden } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { hideModal, useModalStore } from "@/stores/modal";

import styles from "./s.module.css";

const TYPE_CONFIG: Record<string, { icon: AnimatedIconComponent; tone: "green" | "red" | "accent" }> = {
  success: { icon: CheckedIcon, tone: "green" },
  error: { icon: XIcon, tone: "red" },
  info: { icon: InfoCircleIcon, tone: "accent" },
};

function isLongMessage(message: string | undefined): boolean {
  if (!message) return false;
  return message.length > 180 || message.includes("\n");
}

const Base = () => {
  const { t } = useTranslation("modal");
  const variant = useModalStore((state) => state.baseModal.variant ?? state.modalType ?? "info");
  const isOpen = useModalStore((state) => state.baseModal.isOpen);
  const title = useModalStore((state) => state.baseModal.title);
  const message = useModalStore((state) => state.baseModal.message);
  const confirmText = useModalStore((state) => state.baseModal.confirmText);
  const onClick = useModalStore((state) => state.baseModal.onClick);

  const handleClose = () => {
    hideModal(variant);
    if (onClick) onClick();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  const config = TYPE_CONFIG[variant] ?? TYPE_CONFIG.info;
  const Icon = config.icon;
  const long = isLongMessage(message);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Content size="3" maxWidth={long ? "40rem" : "26.25rem"}>
        <Flex direction="column" align="center" gap="4" width="100%">
          <Flex align="center" justify="center" className={styles.stamp} data-tone={config.tone}>
            <Icon size={24} />
          </Flex>
          {title ? (
            <Dialog.Title align="center" mb="0">
              {title}
            </Dialog.Title>
          ) : (
            <VisuallyHidden>
              <Dialog.Title>{variant}</Dialog.Title>
            </VisuallyHidden>
          )}
          {long ? (
            <ScrollArea type="auto" scrollbars="vertical" className={styles.log}>
              <Dialog.Description size="2" color="gray" align="left" className={styles.logText}>
                {message || t("noMessage")}
              </Dialog.Description>
            </ScrollArea>
          ) : (
            <Dialog.Description size="2" color="gray" align="center" className={styles.shortText}>
              {message || t("noMessage")}
            </Dialog.Description>
          )}
          <Flex direction="column" width="100%">
            <Button size="3" onClick={handleClose}>
              {confirmText || t("ok")}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

Base.displayName = "Base";

export default Base;

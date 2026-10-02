import { Check, Info, X, type LucideIcon as LucideGlyph } from "lucide-react";
import { CheckIcon } from "@radix-ui/react-icons";
import { Box, Button, Container, Dialog, Flex, Section, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { LucideIcon } from "@/components";
import { hideModal, useModalStore } from "@/stores/modal";

import styles from "./s.module.css";

const TYPE_CONFIG: Record<string, { icon: LucideGlyph; color: "green" | "red" | "blue" }> = {
  success: { icon: Check, color: "green" },
  error: { icon: X, color: "red" },
  info: { icon: Info, color: "blue" },
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
  const long = isLongMessage(message);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Box className={styles.shellClip}><Dialog.Content maxWidth={long ? "40rem" : "26.25rem"} className={styles.shellPy}>
        <Container width="100%" maxWidth="none" px="5" >
          <Section py="5">
            <Flex direction="column" align="center" gap="4" width="100%">
              <Text color={config.color}>
                <LucideIcon icon={config.icon} size={28} strokeWidth={1.8} />
              </Text>
              {title ? (
                <Dialog.Title align="center">{title}</Dialog.Title>
              ) : (
                <Dialog.Title className={styles.srOnly}>{variant}</Dialog.Title>
              )}
              <Box width="100%">
                {long ? (
                  <Box className={styles.log}>
                    <Dialog.Description size="2" color="gray" align="left" className={styles.logText}>
                      {message || t("noMessage")}
                    </Dialog.Description>
                  </Box>
                ) : (
                  <Dialog.Description size="2" color="gray" align="center" className={styles.shortText}>
                    {message || t("noMessage")}
                  </Dialog.Description>
                )}
              </Box>
              <Button onClick={handleClose} className={styles.ok}>
                <CheckIcon />
                {confirmText || t("ok")}
              </Button>
            </Flex>
          </Section>
        </Container>
      </Dialog.Content></Box>
    </Dialog.Root>
  );
};

Base.displayName = "Base";

export default Base;

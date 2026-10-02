import { PenIcon, RefreshIcon, TrashIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Container, Flex, Section, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { IconButton } from "@/components";
import { useOperationCertificate } from "@/features/certificate";

import styles from "./s.module.css";

interface CertificateOperationsProps {
  certificateId: string;
}

const CertificateOperations = memo(({ certificateId }: CertificateOperationsProps) => {
  const { t } = useTranslation("certDetail");
  const { handleEdit, handleReapply, handleDelete, isDeleting, isReapplying } = useOperationCertificate(certificateId);

  return (
    <Container width="100%" maxWidth="100%" px="4">
      <Section py="4">
        <Flex direction="column" gap="3">
          <Text as="p" size="1" weight="medium" className={styles.title}>
            {t("actions.operations") || "Operations"}
          </Text>
          <Flex direction="column" gap="2">
            <IconButton onClick={handleEdit} variant="secondary" icon={<PenIcon size={16} />}>
              {t("actions.update") || "Update"}
            </IconButton>
            <IconButton onClick={handleReapply} variant="secondary" icon={<RefreshIcon size={16} />} disabled={isReapplying}>
              {isReapplying ? t("reapply.applying") : t("actions.reapply")}
            </IconButton>
            <IconButton onClick={handleDelete} variant="secondary" icon={<TrashIcon size={16} />} disabled={isDeleting} style={{ color: "var(--accent-9)" }}>
              {isDeleting ? t("delete.deleting") || "Deleting..." : t("actions.delete") || "Delete"}
            </IconButton>
          </Flex>
        </Flex>
      </Section>
    </Container>
  );
});

CertificateOperations.displayName = "CertificateOperations";

export default CertificateOperations;

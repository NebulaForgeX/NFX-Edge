import { PenIcon, RefreshIcon, TrashIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
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
    <Box className={styles.frame}>
      <Box px="4">
        <Box py="5">
          <Flex direction="column" gap="4">
            <Text as="p" size="1" weight="medium" className={styles.title}>
              {t("actions.operations") || "Operations"}
            </Text>
            <Flex gap="3" wrap="wrap">
              <IconButton onClick={handleEdit} variant="secondary" icon={<PenIcon size={16} />}>
                {t("actions.update") || "Update"}
              </IconButton>
              <IconButton
                onClick={handleReapply}
                variant="secondary"
                icon={<RefreshIcon size={16} />}
                disabled={isReapplying}
              >
                {isReapplying ? t("reapply.applying") : t("actions.reapply")}
              </IconButton>
              <IconButton
                onClick={handleDelete}
                variant="secondary"
                icon={<TrashIcon size={16} />}
                disabled={isDeleting}
                style={{ color: "var(--color-danger)" }}
              >
                {isDeleting ? t("delete.deleting") || "Deleting..." : t("actions.delete") || "Delete"}
              </IconButton>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
});

CertificateOperations.displayName = "CertificateOperations";

export default CertificateOperations;

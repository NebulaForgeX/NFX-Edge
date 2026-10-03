import { PenIcon, RefreshIcon, TrashIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Flex, Text } from "@radix-ui/themes";
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
    <Flex direction="column" gap="3">
      <Text as="p" size="1" weight="medium" color="gray" className={styles.title}>
        {t("actions.operations")}
      </Text>
      <Flex direction="column" gap="2">
        <IconButton onClick={handleEdit} variant="outline" color="gray" fullWidth icon={<PenIcon size={16} />}>
          {t("actions.update")}
        </IconButton>
        <IconButton onClick={handleReapply} variant="outline" color="gray" fullWidth icon={<RefreshIcon size={16} />} loading={isReapplying}>
          {isReapplying ? t("reapply.applying") : t("actions.reapply")}
        </IconButton>
        <IconButton onClick={handleDelete} variant="outline" color="red" fullWidth icon={<TrashIcon size={16} />} loading={isDeleting}>
          {isDeleting ? t("delete.deleting") : t("actions.delete")}
        </IconButton>
      </Flex>
    </Flex>
  );
});

CertificateOperations.displayName = "CertificateOperations";

export default CertificateOperations;

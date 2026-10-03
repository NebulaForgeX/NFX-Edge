import { DownloadIcon, StackIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { IconButton } from "@/components";
import { useDownloadCertificate, useExportToFolder } from "@/features/certificate";

import styles from "./s.module.css";

interface ExportCertificateProps {
  certificate: string;
  privateKey: string;
  domain: string;
  certificateId?: string;
}

const ExportCertificate = memo(({ certificate, privateKey, domain, certificateId }: ExportCertificateProps) => {
  const { t } = useTranslation("certDetail");
  const { downloadCertificate, downloadPrivateKey, downloadBoth } = useDownloadCertificate({
    certificate,
    privateKey,
    domain,
  });
  const { exportToWebsitesFolder } = useExportToFolder({
    certificateId,
  });

  return (
    <Flex direction="column" gap="3">
      <Text as="p" size="1" weight="medium" color="gray" className={styles.title}>
        {t("export.title")}
      </Text>
      <Flex direction="column" gap="2">
        <IconButton onClick={downloadBoth} variant="primary" fullWidth icon={<DownloadIcon size={16} />}>
          {t("download.both")}
        </IconButton>
        <IconButton onClick={downloadCertificate} variant="outline" color="gray" fullWidth icon={<DownloadIcon size={16} />}>
          {t("download.certificate")}
        </IconButton>
        <IconButton onClick={downloadPrivateKey} variant="outline" color="gray" fullWidth icon={<DownloadIcon size={16} />}>
          {t("download.privateKey")}
        </IconButton>
        <IconButton onClick={exportToWebsitesFolder} variant="outline" color="gray" fullWidth icon={<StackIcon size={16} />}>
          {t("export.toWebsitesFolder")}
        </IconButton>
      </Flex>
    </Flex>
  );
});

ExportCertificate.displayName = "ExportCertificate";

export default ExportCertificate;

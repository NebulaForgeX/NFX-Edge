import { DownloadIcon, StackIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
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

const ExportCertificate = memo(({
  certificate,
  privateKey,
  domain,
  certificateId,
}: ExportCertificateProps) => {
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
    <Box className={styles.frame}>
      <Box px="4">
        <Box py="5">
          <Flex direction="column" gap="4">
            <Text as="p" size="1" weight="medium" className={styles.title}>
              {t("export.title") || "Export Certificate"}
            </Text>
            <Flex gap="3" wrap="wrap">
              <IconButton onClick={downloadCertificate} variant="primary" icon={<DownloadIcon size={16} />}>
                {t("download.certificate") || "Download Certificate"}
              </IconButton>
              <IconButton onClick={downloadPrivateKey} variant="primary" icon={<DownloadIcon size={16} />}>
                {t("download.privateKey") || "Download Private Key"}
              </IconButton>
              <IconButton onClick={downloadBoth} variant="secondary" icon={<DownloadIcon size={16} />}>
                {t("download.both") || "Download Both"}
              </IconButton>
            </Flex>
            <Flex gap="3" wrap="wrap">
              <IconButton onClick={exportToWebsitesFolder} variant="secondary" icon={<StackIcon size={16} />}>
                {t("export.toWebsitesFolder") || "Export to Websites Folder"}
              </IconButton>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
});

ExportCertificate.displayName = "ExportCertificate";

export default ExportCertificate;

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useExportSingleCertificate } from "@/hooks/file";
import { showError, showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

interface UseExportToFolderProps {
  certificateId?: string;
}

export default function useExportToFolder({ certificateId }: UseExportToFolderProps) {
  const { t } = useTranslation("certDetail");
  const exportMutation = useExportSingleCertificate();

  const exportToWebsitesFolder = useCallback(async () => {
    if (!certificateId) {
      showError(t("export.error.noCertificateId") || "Certificate ID is required");
      return;
    }

    try {
      const result = await exportMutation.mutateAsync(certificateId);

      if (result.success) {
        showSuccess(getCommandMessage(result.message, t("export.success.websitesFolder")));
      } else {
        showError(getCommandMessage(result.message, t("export.error.failed") || "Failed to export certificate"));
      }
    } catch (error) {
      console.error("Export to Websites folder failed:", error);
      showError(t("export.error.failed") || "Failed to export certificate");
    }
  }, [certificateId, exportMutation, t]);

  return {
    exportToWebsitesFolder,
  };
}

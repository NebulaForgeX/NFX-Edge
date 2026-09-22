import type { CertificateInfo } from "@/types";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { useDeleteCertificate } from "@/hooks";
import { ROUTES } from "@/navigations";
import { showConfirm, showError, showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

export default function useActionCertificateItem() {
  const { t } = useTranslation("certCheck");
  const deleteMutation = useDeleteCertificate();

  const handleEdit = useCallback((cert: CertificateInfo) => {
    return () => {
      if (!cert.id) {
        return;
      }
      routerEventEmitter.navigate({ to: ROUTES.CERT_EDIT.replace(":certificateId", encodeURIComponent(cert.id)) });
    };
  }, []);

  const handleView = useCallback((cert: CertificateInfo) => {
    return () => {
      if (!cert.id) {
        return;
      }
      routerEventEmitter.navigate({ to: ROUTES.CERT_DETAIL.replace(":certificateId", encodeURIComponent(cert.id)) });
    };
  }, []);

  const handleDelete = useCallback(
    (cert: CertificateInfo) => {
      return () => {
        if (!cert.id) {
          return;
        }
        showConfirm({
          title: t("delete.confirm.title") || "Delete Certificate",
          message: (t("delete.confirm.message") || `Are you sure you want to delete the certificate for domain "{{domain}}"?`).replace(
            "{{domain}}",
            cert.domain,
          ),
          confirmText: t("delete.confirm.confirm") || "Delete",
          cancelText: t("delete.confirm.cancel") || "Cancel",
          onConfirm: async () => {
            try {
              const result = await deleteMutation.mutateAsync({
                certificateId: cert.id,
              });

              if (result.success) {
                showSuccess(getCommandMessage(result.message, t("delete.success")));
              } else {
                showError(getCommandMessage(result.message, t("delete.error")));
              }
            } catch {
              // useDeleteCertificate onError already surfaces Axios / API errors
            }
          },
        });
      };
    },
    [deleteMutation, t],
  );

  return { handleEdit, handleView, handleDelete };
}

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { useCertificateDetailById, useDeleteCertificate, useReapplyCertificate } from "@/hooks";
import { ROUTES } from "@/navigations";
import { hideModal, showConfirm, showError, showLoading, showSuccess } from "@/stores/modal";
import { buildCertCheckPath } from "@/utils/certCheckUrl";
import { getCommandMessage } from "@/utils";

export default function useOperationCertificate(certificateId: string) {
  const { t } = useTranslation("certDetail");
  const { t: tc } = useTranslation("common");
  const deleteMutation = useDeleteCertificate();
  const reapplyMutation = useReapplyCertificate();
  const { data: certificate } = useCertificateDetailById(certificateId);

  const handleEdit = useCallback(() => {
    if (!certificateId) {
      return;
    }
    routerEventEmitter.navigate({ to: ROUTES.CERT_EDIT.replace(":certificateId", encodeURIComponent(certificateId)) });
  }, [certificateId]);

  const handleReapply = useCallback(() => {
    if (!certificate) {
      showError(t("reapply.notLoaded"));
      return;
    }
    const domain = certificate.domain;
    const line1 = t("reapply.confirm").replace("{{domain}}", domain);
    const message = `${line1}\n\n${t("reapply.confirmDetail")}`;

    showConfirm({
      title: t("reapply.title"),
      message,
      confirmText: t("reapply.confirmSubmit"),
      cancelText: t("delete.confirm.cancel"),
      forceRenewalOption: {
        label: t("reapply.forceRenewal"),
        defaultChecked: Boolean(certificate.sansChanged),
      },
      onConfirm: (opts) => {
        const forceRenewal = opts?.forceRenewal ?? false;
        void (async () => {
          showLoading({ message: t("reapply.applying") });
          try {
            const result = await reapplyMutation.mutateAsync({
              certificateId,
              forceRenewal,
            });
            if (result.success) {
              showSuccess(getCommandMessage(result.message, tc("messages.certificateApplySuccess")));
              routerEventEmitter.navigate({ to: ROUTES.CERTS_OVERVIEW });
            } else {
              let msg = getCommandMessage(result.message, tc("messages.certificateApplyFailed"));
              if (result.rateLimit && result.retryAfter) {
                msg = `${msg} (retry after ${result.retryAfter})`;
              }
              showError(msg);
            }
          } catch {
            // useReapplyCertificate onError already surfaces the error
          } finally {
            hideModal("loading");
          }
        })();
      },
    });
  }, [reapplyMutation, certificate, certificateId, t, tc]);

  const handleDelete = useCallback(() => {
    if (!certificate) {
      return;
    }
    const domain = certificate.domain;

    showConfirm({
      title: t("delete.confirm.title") || "Delete Certificate",
      message: (t("delete.confirm.message") || `Are you sure you want to delete the certificate for domain "{{domain}}"?`).replace(
        "{{domain}}",
        domain,
      ),
      confirmText: t("delete.confirm.confirm") || "Delete",
      cancelText: t("delete.confirm.cancel") || "Cancel",
      onConfirm: async () => {
        try {
          const result = await deleteMutation.mutateAsync({
            certificateId,
          });

          if (result.success) {
            showSuccess(getCommandMessage(result.message, t("delete.success")));
            routerEventEmitter.navigate({ to: buildCertCheckPath() });
          } else {
            showError(t("delete.error"));
          }
        } catch {
          // useDeleteCertificate onError already surfaces Axios / API errors
        }
      },
    });
  }, [deleteMutation, certificate, certificateId, t]);

  return {
    handleEdit,
    handleReapply,
    handleDelete,
    isDeleting: deleteMutation.isPending,
    isReapplying: reapplyMutation.isPending,
  };
}

import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../schemas/certificateSchema";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { useCreateCertificate } from "@/hooks";
import { ROUTES } from "@/navigations";
import { showError, showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

export const useSubmitManualCertificate = () => {
  const { t } = useTranslation("common");
  const { mutateAsync, isPending } = useCreateCertificate();

  const onSubmit = useCallback(
    async (values: CertificateFormValues) => {
      try {
        const result = await mutateAsync({
          domain: values.domain.trim(),
          certificate: values.certificate.trim(),
          privateKey: values.privateKey.trim(),
          sans: values.sans && values.sans.length > 0 ? values.sans : undefined,
          folderName: values.folderName?.trim() || undefined,
          email: values.email?.trim() || undefined,
          issuer: values.issuer?.trim() || undefined,
        });

        if (result.success) {
          showSuccess(getCommandMessage(result.message, t("messages.certificateCreateSuccess")));
          routerEventEmitter.navigate({ to: ROUTES.CERTS_OVERVIEW });
        } else {
          showError(getCommandMessage(result.message, t("messages.certificateCreateFailed")));
        }
      } catch {
        // useCreateCertificate onError already surfaces Axios / API errors
      }
    },
    [mutateAsync, t],
  );

  const onSubmitError = useCallback(
    (errors: FieldErrors<CertificateFormValues>) => {
      const firstError = Object.values(errors)[0];
      showError(firstError?.message || t("messages.checkFormErrors"));
    },
    [t],
  );

  return {
    onSubmit,
    onSubmitError,
    isPending,
  };
};

export default useSubmitManualCertificate;

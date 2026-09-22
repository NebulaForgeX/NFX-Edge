import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../schemas/certificateSchema";
import type { ApplyCertificateRequest } from "@/types/requests/cert.request";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { useApplyCertificate } from "@/hooks";
import { ROUTES } from "@/navigations";
import { showConfirm, showError, showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

const ALREADY_EXISTS = "CERTIFICATE_ALREADY_EXISTS";

export const useSubmitCertificate = () => {
  const { t } = useTranslation("common");
  const { t: te } = useTranslation("certificateElements");
  const { mutateAsync, isPending } = useApplyCertificate();

  const apply = useCallback(
    async (payload: ApplyCertificateRequest) => {
      try {
        const result = await mutateAsync(payload);
        if (result.success) {
          showSuccess(getCommandMessage(result.message, t("messages.certificateApplySuccess")));
          routerEventEmitter.navigate({ to: ROUTES.CERTS_OVERVIEW });
          return;
        }
        if (result.message === ALREADY_EXISTS && !payload.forceRenewal) {
          showConfirm({
            title: te("overwrite.title"),
            message: te("overwrite.message", { domain: payload.domain }),
            confirmText: te("overwrite.confirm"),
            cancelText: te("overwrite.cancel"),
            onConfirm: () => {
              void apply({ ...payload, forceRenewal: true });
            },
          });
          return;
        }
        let msg = getCommandMessage(result.message, t("messages.certificateApplyFailed"));
        if (result.rateLimit && result.retryAfter) {
          msg = `${msg} (retry after ${result.retryAfter})`;
        }
        showError(msg);
      } catch {
        // useApplyCertificate onError already surfaces Axios / API errors
      }
    },
    [mutateAsync, t, te],
  );

  const onSubmit = useCallback(
    async (values: CertificateFormValues) => {
      const email = values.email?.trim();
      if (!email) {
        showError(t("validation.emailRequired"));
        return;
      }
      await apply({
        domain: values.domain.trim(),
        email,
        sans: values.sans && values.sans.length > 0 ? values.sans : undefined,
        folderName: values.folderName?.trim() || undefined,
        webroot: values.webroot?.trim() || undefined,
        forceRenewal: values.forceRenewal,
      });
    },
    [apply, t],
  );

  const onSubmitError = useCallback(
    (errors: FieldErrors<CertificateFormValues>) => {
      console.error("Form validation errors:", errors);
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

export default useSubmitCertificate;

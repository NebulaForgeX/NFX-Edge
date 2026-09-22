import type { FieldErrors } from "react-hook-form";
import type { EditCertificateFormValues } from "../schemas/certificateSchema";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { useUpdateManualAddCertificate } from "@/hooks";
import { showError, showSuccess } from "@/stores/modal";
import { ROUTES } from "@/navigations";
import { getCommandMessage } from "@/utils";

export const useEditCertificate = (certificateId: string) => {
  const { t } = useTranslation("common");
  const { mutateAsync, isPending } = useUpdateManualAddCertificate();

  const onSubmit = useCallback(
    async (values: EditCertificateFormValues) => {
      try {
        if (!certificateId) {
          showError(t("messages.certificateIdMissing"));
          return;
        }
        const folderName = values.folderName?.trim() ?? "";
        const email = values.email?.trim() ?? "";
        const result = await mutateAsync({
          certificateId,
          sans: values.sans ?? [],
          folderName,
          email: email || undefined,
        });

        if (result.success) {
          showSuccess(getCommandMessage(result.message, t("messages.certificateUpdateSuccess")));
          routerEventEmitter.navigate({ to: ROUTES.CERTS_OVERVIEW });
        } else {
          showError(getCommandMessage(result.message, t("messages.certificateUpdateFailed")));
        }
      } catch {
        // useUpdateManualAddCertificate onError already surfaces Axios / API errors
      }
    },
    [mutateAsync, certificateId, t],
  );

  const onSubmitError = useCallback(
    (errors: FieldErrors<EditCertificateFormValues>) => {
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

export default useEditCertificate;

import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../../schemas/certificateSchema";

import { memo, useCallback } from "react";
import { Button, Flex, Grid } from "@radix-ui/themes";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SparklesIcon } from "nfx-ui/icons";
import { safeArray, safeStringable } from "nfx-ui/utils";

import { useParseCertificatePreview } from "@/hooks";
import { showError, showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

import {
  CertificateController,
  DomainController,
  EmailControllerForAdd,
  FolderNameController,
  IssuerController,
  PrivateKeyController,
  SANsController,
} from "../../controllers";
import { FormSection } from "@/components";

export interface CertificateImportFormProps {
  onSubmit: (data: CertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<CertificateFormValues>) => void;
  isPending: boolean;
}

const CertificateImportForm = memo(({ onSubmit, onSubmitError, isPending }: CertificateImportFormProps) => {
  const { t } = useTranslation("certificateElements");
  const methods = useFormContext<CertificateFormValues>();
  const { mutateAsync: parsePreview, isPending: parsing } = useParseCertificatePreview();

  const handleParsed = useCallback(
    async (text: string) => {
      try {
        const r = await parsePreview({ certificate: text.trim() });
        if (!r.success) {
          showError(getCommandMessage(r.message, t("upload.parseFailed")));
          return;
        }
        if (r.domain) methods.setValue("domain", r.domain, { shouldValidate: true });
        const sansList = safeArray<string>(r.sans);
        if (sansList.length) {
          const primary = safeStringable(r.domain).trim().toLowerCase();
          const filtered = sansList.map((s: string) => s.trim()).filter(Boolean);
          const dedup = primary ? filtered.filter((s: string) => s.toLowerCase() !== primary) : filtered;
          methods.setValue("sans", dedup, { shouldValidate: true });
        }
        if (r.issuer) methods.setValue("issuer", r.issuer, { shouldValidate: true });
        showSuccess(getCommandMessage(r.message, t("upload.parseOk")));
      } catch {
        showError(t("upload.parseFailed"));
      }
    },
    [methods, parsePreview, t],
  );

  return (
    <Flex asChild direction="column" gap="4">
      <form onSubmit={(e) => e.preventDefault()}>
        <FormSection
          step={1}
          title={t("form.sectionPem")}
          hint={t("form.sectionPemHint")}
          footer={
            <Button
              type="button"
              variant="outline"
              color="gray"
              loading={parsing}
              disabled={!methods.watch("certificate")?.trim()}
              onClick={() => void handleParsed(methods.getValues("certificate"))}
            >
              <SparklesIcon size={14} />
              {t("upload.parseFill")}
            </Button>
          }
        >
          <Grid columns={{ initial: "1", md: "2" }} gap="4">
            <CertificateController />
            <PrivateKeyController />
          </Grid>
        </FormSection>
        <FormSection
          step={2}
          title={t("form.basicInfo")}
          footer={
            <Button type="button" size="2" disabled={isPending} loading={isPending} onClick={methods.handleSubmit(onSubmit, onSubmitError)}>
              {isPending ? t("form.creating") : t("form.create")}
            </Button>
          }
        >
          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <DomainController />
            <FolderNameController />
            <EmailControllerForAdd />
            <IssuerController record />
          </Grid>
          <SANsController />
        </FormSection>
      </form>
    </Flex>
  );
});

CertificateImportForm.displayName = "CertificateImportForm";

export default CertificateImportForm;

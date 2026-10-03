import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../../schemas/certificateSchema";

import { memo, useCallback, useRef } from "react";
import { Button, Card, Flex, Grid } from "@radix-ui/themes";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { RocketIcon, UploadIcon } from "nfx-ui/icons";
import { safeArray, safeStringable } from "nfx-ui/utils";

import { useParseCertificatePreview } from "@/hooks";
import { showError, showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

import { DomainController, EmailControllerForAdd, FolderNameController, ForceRenewalController, IssuerController, SANsController } from "../../controllers";
import { FormSection } from "@/components";
import NamecheapHostsHint from "../NamecheapHostsHint";

import styles from "./s.module.css";

export interface CertificateApplyFormProps {
  onSubmit: (data: CertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<CertificateFormValues>) => void;
  isPending: boolean;
}

const CertificateApplyForm = memo(({ onSubmit, onSubmitError, isPending }: CertificateApplyFormProps) => {
  const { t } = useTranslation("certificateElements");
  const [searchParams] = useSearchParams();
  const lockedApex = Boolean((searchParams.get("domain") ?? "").trim());
  const methods = useFormContext<CertificateFormValues>();
  const certFileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: parsePreview, isPending: parsing } = useParseCertificatePreview();

  const handleCertFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      try {
        const text = await file.text();
        const r = await parsePreview({ certificate: text.trim() });
        if (!r.success) {
          showError(getCommandMessage(r.message, t("upload.parseFailed")));
          return;
        }
        if (r.domain && !lockedApex) methods.setValue("domain", r.domain, { shouldValidate: true });
        const sansList = safeArray<string>(r.sans);
        if (sansList.length) {
          const primary = safeStringable(r.domain).trim().toLowerCase();
          const filtered = sansList.map((s: string) => s.trim()).filter(Boolean);
          const dedup = primary ? filtered.filter((s: string) => s.toLowerCase() !== primary) : filtered;
          methods.setValue("sans", dedup, { shouldValidate: true });
        }
        showSuccess(getCommandMessage(r.message, t("upload.parseOk")));
      } catch {
        showError(t("upload.parseFailed"));
      }
    },
    [lockedApex, methods, parsePreview, t],
  );

  return (
    <Flex asChild direction="column" gap="4">
      <form onSubmit={(e) => e.preventDefault()}>
        <FormSection
          step={1}
          title={t("form.sectionImport")}
          hint={t("form.sectionImportHint")}
          footer={
            <>
              <input ref={certFileRef} type="file" accept=".pem,.crt,.cer,.txt" className={styles.hiddenFile} onChange={handleCertFile} />
              <Button type="button" variant="outline" color="gray" loading={parsing} onClick={() => certFileRef.current?.click()}>
                <UploadIcon size={14} />
                {t("upload.certPemParseOnly")}
              </Button>
            </>
          }
        />
        <FormSection step={2} title={t("form.basicInfo")}>
          <Grid columns={{ initial: "1", xl: "minmax(0, 3fr) minmax(0, 2fr)" }} gap="5">
            <Flex direction="column" gap="4" minWidth="0">
              <Grid columns={{ initial: "1", sm: "2" }} gap="4">
                <DomainController />
                <FolderNameController />
                <EmailControllerForAdd requireEmail />
                <IssuerController />
              </Grid>
              <SANsController />
            </Flex>
            <Card size="2" variant="surface">
              <NamecheapHostsHint />
            </Card>
          </Grid>
        </FormSection>
        <FormSection
          step={3}
          title={t("form.verification")}
          footer={
            <Button type="button" size="2" disabled={isPending} loading={isPending} onClick={methods.handleSubmit(onSubmit, onSubmitError)}>
              <RocketIcon size={14} />
              {isPending ? t("form.applySubmitting") : t("form.applySubmit")}
            </Button>
          }
        >
          <ForceRenewalController />
        </FormSection>
      </form>
    </Flex>
  );
});

CertificateApplyForm.displayName = "CertificateApplyForm";

export default CertificateApplyForm;

import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../../schemas/certificateSchema";

import { memo, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { Button } from "@/components";
import { Box, Flex } from "@radix-ui/themes";
import { safeArray, safeStringable } from "nfx-ui/utils";

import {
  DomainController,
  EmailControllerForAdd,
  FolderNameController,
  ForceRenewalController,
  IssuerController,
  SANsController,
  WebrootController,
} from "../../controllers";
import NamecheapHostsHint from "../NamecheapHostsHint";
import { useParseCertificatePreview } from "@/hooks";
import { showError, showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

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
    <div className={styles.root}>
      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("form.sectionImport")}</h3>
          <p className={styles.sectionHint}>{t("form.sectionImportHint")}</p>
          <div className={styles.uploadRow}>
            <input
              ref={certFileRef}
              type="file"
              accept=".pem,.crt,.cer,.txt"
              className={styles.hiddenFile}
              onChange={handleCertFile}
            />
            <Button type="button" variant="outline" disabled={parsing} onClick={() => certFileRef.current?.click()}>
              {parsing ? t("upload.parsing") : t("upload.certPemParseOnly")}
            </Button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("form.basicInfo")}</h3>
          <Flex gap="4" align="stretch" wrap="wrap" width="100%">
            <Box className={styles.splitMain}>
              <Flex direction="column" gap="4" width="100%" height="100%">
                <div className={styles.leftColumn}>
                  <DomainController />
                  <FolderNameController />
                  <EmailControllerForAdd requireEmail />
                  <IssuerController />
                </div>
                <SANsController />
              </Flex>
            </Box>
            <Box className={styles.sideSlot}>
              <Box className={styles.sideRule}>
                <Box px="4" className={styles.sideFill}>
                  <NamecheapHostsHint />
                </Box>
              </Box>
            </Box>
          </Flex>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("form.verification")}</h3>
          <WebrootController />
          <ForceRenewalController />
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="primary"
            size="large"
            className={styles.submitBtn}
            disabled={isPending}
            onClick={methods.handleSubmit(onSubmit, onSubmitError)}
          >
            {isPending ? t("form.applySubmitting") : t("form.applySubmit")}
          </Button>
        </div>
      </form>
    </div>
  );
});

CertificateApplyForm.displayName = "CertificateApplyForm";

export default CertificateApplyForm;

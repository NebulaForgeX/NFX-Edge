import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../../schemas/certificateSchema";

import { memo, useCallback, useRef } from "react";
import { Box, Button, Flex, Grid, Text } from "@radix-ui/themes";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { safeArray, safeStringable } from "nfx-ui/utils";

import { useParseCertificatePreview } from "@/hooks";
import { showError, showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

import {
  DomainController,
  EmailControllerForAdd,
  FolderNameController,
  ForceRenewalController,
  IssuerController,
  SANsController,
} from "../../controllers";
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
    <form onSubmit={(e) => e.preventDefault()}>
      <Box className={styles.hairline}>
        <Box py="5">
          <Flex direction="column" gap="4">
            <Text className={styles.kicker}>{t("form.sectionImport")}</Text>
            <Text as="p" size="2" className={styles.lede}>
              {t("form.sectionImportHint")}
            </Text>
            <input ref={certFileRef} type="file" accept=".pem,.crt,.cer,.txt" className={styles.hiddenFile} onChange={handleCertFile} />
            <Flex>
              <Button type="button" variant="outline" disabled={parsing} onClick={() => certFileRef.current?.click()}>
                {parsing ? t("upload.parsing") : t("upload.certPemParseOnly")}
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Box>
      <Box className={styles.hairline}>
        <Box py="5">
          <Flex direction="column" gap="4">
            <Text className={styles.kicker}>{t("form.basicInfo")}</Text>
            <Grid columns={{ initial: "1", lg: "2fr 1fr" }} gap="5">
              <Flex direction="column" gap="4">
                <Grid columns={{ initial: "1", sm: "2" }} gap="4">
                  <DomainController />
                  <FolderNameController />
                  <EmailControllerForAdd requireEmail />
                  <IssuerController />
                </Grid>
                <SANsController />
              </Flex>
              <Box className={styles.sideRule}>
                <Box px="4">
                  <NamecheapHostsHint />
                </Box>
              </Box>
            </Grid>
          </Flex>
        </Box>
      </Box>
      <Box className={styles.hairline}>
        <Box py="5">
          <Flex direction="column" gap="4">
            <Text className={styles.kicker}>{t("form.verification")}</Text>
            <ForceRenewalController />
            <Flex justify="end">
              <Button type="button" size="2" disabled={isPending} loading={isPending} onClick={methods.handleSubmit(onSubmit, onSubmitError)}>
                {isPending ? t("form.applySubmitting") : t("form.applySubmit")}
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </form>
  );
});

CertificateApplyForm.displayName = "CertificateApplyForm";

export default CertificateApplyForm;

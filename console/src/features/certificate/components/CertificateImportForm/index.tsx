import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../../schemas/certificateSchema";

import { memo, useCallback } from "react";
import { Box, Button, Flex, Grid, Section, Text } from "@radix-ui/themes";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
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

import styles from "./s.module.css";

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
    <form onSubmit={(e) => e.preventDefault()}>
      <Box className={styles.hairline}>
        <Section size="1" py="5">
          <Flex direction="column" gap="4">
            <Text className={styles.kicker}>{t("form.sectionPem")}</Text>
            <Text as="p" size="2" className={styles.lede}>
              {t("form.sectionPemHint")}
            </Text>
            <CertificateController />
            <PrivateKeyController />
            <Flex>
              <Button type="button" variant="outline" disabled={parsing || !methods.watch("certificate")?.trim()} onClick={() => void handleParsed(methods.getValues("certificate"))}>
                {parsing ? t("upload.parsing") : t("upload.parseFill")}
              </Button>
            </Flex>
          </Flex>
        </Section>
      </Box>
      <Box className={styles.hairline}>
        <Section size="1" py="5">
          <Flex direction="column" gap="4">
            <Text className={styles.kicker}>{t("form.basicInfo")}</Text>
            <Grid columns={{ initial: "1", sm: "2" }} gap="4">
              <DomainController />
              <FolderNameController />
              <EmailControllerForAdd />
              <IssuerController record />
            </Grid>
            <SANsController />
            <Flex justify="end">
              <Button type="button" size="2" disabled={isPending} loading={isPending} onClick={methods.handleSubmit(onSubmit, onSubmitError)}>
                {isPending ? t("form.creating") : t("form.create")}
              </Button>
            </Flex>
          </Flex>
        </Section>
      </Box>
    </form>
  );
});

CertificateImportForm.displayName = "CertificateImportForm";

export default CertificateImportForm;

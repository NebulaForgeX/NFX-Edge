import type { FieldErrors } from "react-hook-form";
import type { EditCertificateFormValues } from "../../schemas/certificateSchema";

import { memo } from "react";
import { Box, Button, Flex, Grid, Section, Text } from "@radix-ui/themes";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  DomainController,
  EmailControllerForAdd,
  FolderNameController,
  IssuerController,
  SANsController,
} from "../../controllers";

import styles from "./s.module.css";

export interface CertificateEditFormProps {
  onSubmit: (data: EditCertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<EditCertificateFormValues>) => void;
  isPending: boolean;
}

const CertificateEditForm = memo(({ onSubmit, onSubmitError, isPending }: CertificateEditFormProps) => {
  const { t } = useTranslation("certificateElements");
  const methods = useFormContext<EditCertificateFormValues>();

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Box className={styles.hairline}>
        <Section size="1" py="5">
          <Flex direction="column" gap="4">
            <Text className={styles.kicker}>{t("form.basicInfo")}</Text>
            <Text as="p" size="2" className={styles.lede}>
              {t("form.editHint")}
            </Text>
            <Grid columns={{ initial: "1", sm: "2" }} gap="4">
              <DomainController readOnly />
              <FolderNameController />
              <EmailControllerForAdd requireEmail={false} prefillAccount={false} />
              <IssuerController record />
            </Grid>
          </Flex>
        </Section>
      </Box>
      <Box className={styles.hairline}>
        <Section size="1" py="5">
          <Flex direction="column" gap="4">
            <SANsController />
            <Flex justify="end">
              <Button size="2" disabled={isPending} loading={isPending} onClick={methods.handleSubmit(onSubmit, onSubmitError)}>
                {isPending ? t("form.updating") : t("form.update")}
              </Button>
            </Flex>
          </Flex>
        </Section>
      </Box>
    </form>
  );
});

CertificateEditForm.displayName = "CertificateEditForm";

export default CertificateEditForm;

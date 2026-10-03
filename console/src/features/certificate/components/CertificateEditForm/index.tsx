import type { FieldErrors } from "react-hook-form";
import type { EditCertificateFormValues } from "../../schemas/certificateSchema";

import { memo } from "react";
import { Button, Flex, Grid } from "@radix-ui/themes";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { DomainController, EmailControllerForAdd, FolderNameController, IssuerController, SANsController } from "../../controllers";
import { FormSection } from "@/components";

export interface CertificateEditFormProps {
  onSubmit: (data: EditCertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<EditCertificateFormValues>) => void;
  isPending: boolean;
}

const CertificateEditForm = memo(({ onSubmit, onSubmitError, isPending }: CertificateEditFormProps) => {
  const { t } = useTranslation("certificateElements");
  const methods = useFormContext<EditCertificateFormValues>();

  return (
    <Flex asChild direction="column" gap="4">
      <form onSubmit={(e) => e.preventDefault()}>
        <FormSection step={1} title={t("form.basicInfo")} hint={t("form.editHint")}>
          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <DomainController readOnly />
            <FolderNameController />
            <EmailControllerForAdd requireEmail={false} prefillAccount={false} />
            <IssuerController record />
          </Grid>
        </FormSection>
        <FormSection
          step={2}
          title={t("form.sans")}
          footer={
            <Button size="2" disabled={isPending} loading={isPending} onClick={methods.handleSubmit(onSubmit, onSubmitError)}>
              {isPending ? t("form.updating") : t("form.update")}
            </Button>
          }
        >
          <SANsController />
        </FormSection>
      </form>
    </Flex>
  );
});

CertificateEditForm.displayName = "CertificateEditForm";

export default CertificateEditForm;

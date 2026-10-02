import { ArrowNarrowLeftIcon, PenIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { ActionBar, PageHeader, Suspense } from "@/components";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { CertificateEditForm, useInitCertificateForm, useEditCertificate } from "@/features/certificate";
import { useCertificateDetailById } from "@/hooks";

import styles from "./s.module.css";

const CertEditPageContent = memo(({ certificateId }: { certificateId: string }) => {
  const { t } = useTranslation("certEdit");
  const { data: certificate } = useCertificateDetailById(certificateId);
  const methods = useInitCertificateForm(certificate);
  const { onSubmit, onSubmitError, isPending } = useEditCertificate(certificateId);

  return (
    <FormProvider {...methods}>
      <PageFrame>
        <PageHeader
          icon={PenIcon}
          index={t("index")}
          title={`${t("title")} — ${certificate.domain}`}
          description={t("subtitle")}
        />
        <ActionBar>
          <Button variant="ghost" onClick={() => routerEventEmitter.navigateBack()}>
            <ArrowNarrowLeftIcon size={16} />
          </Button>
        </ActionBar>
        <Grid columns={{ initial: "1", lg: "minmax(0, 1fr) 18rem" }} gap="6" align="start">
          <CertificateEditForm onSubmit={onSubmit} onSubmitError={onSubmitError} isPending={isPending} />
          <Section size="1" py="4" className={styles.side}>
            <Container size="2" px="4" width="100%">
              <Flex direction="column" gap="2">
                <Text size="1" color="gray">
                  {certificate.domain}
                </Text>
                <Text size="2">{t("subtitle")}</Text>
              </Flex>
            </Container>
          </Section>
        </Grid>
      </PageFrame>
    </FormProvider>
  );
});

CertEditPageContent.displayName = "CertEditPageContent";

export default function CertEditPage() {
  const { t } = useTranslation("certEdit");
  const { certificateId } = useParams<{ certificateId: string }>();

  if (!certificateId) {
    routerEventEmitter.navigateBack();
    return null;
  }

  return (
    <Suspense loadingText={t("loading")}>
      <CertEditPageContent certificateId={certificateId} />
    </Suspense>
  );
}

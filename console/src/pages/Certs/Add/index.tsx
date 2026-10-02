import { ArrowNarrowLeftIcon, FileDescriptionIcon } from "nfx-ui/icons";
import { memo, useState } from "react";
import { Button, Container, Flex, Grid, Section, SegmentedControl, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { ActionBar, PageHeader, Suspense } from "@/components";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import {
  CertificateApplyForm,
  CertificateImportForm,
  useInitApplyCertificateForm,
  useInitManualCertificateForm,
  useSubmitCertificate,
  useSubmitManualCertificate,
} from "@/features/certificate";

import styles from "./s.module.css";

type AddMode = "acme" | "pem";

const CertAddPage = memo(() => {
  const { t } = useTranslation("certAdd");
  const [mode, setMode] = useState<AddMode>("acme");

  const applyMethods = useInitApplyCertificateForm();
  const applySubmit = useSubmitCertificate();
  const importMethods = useInitManualCertificateForm();
  const importSubmit = useSubmitManualCertificate();

  const handleBack = () => routerEventEmitter.navigateBack();
  const methods = mode === "acme" ? applyMethods : importMethods;
  const isPending = mode === "acme" ? applySubmit.isPending : importSubmit.isPending;

  return (
    <FormProvider {...methods}>
      <PageFrame>
        <PageHeader
          icon={FileDescriptionIcon}
          index={t("index")}
          title={t("title")}
        />
        <ActionBar>
          <SegmentedControl.Root value={mode} onValueChange={(value) => setMode(value as AddMode)}>
            <SegmentedControl.Item value="acme">{t("mode.acme")}</SegmentedControl.Item>
            <SegmentedControl.Item value="pem">{t("mode.pem")}</SegmentedControl.Item>
          </SegmentedControl.Root>
          <Button variant="ghost" onClick={handleBack}>
            <ArrowNarrowLeftIcon size={16} />
          </Button>
        </ActionBar>
        <Grid columns={{ initial: "1", lg: "minmax(0, 1fr) 16rem" }} gap="6" align="start">
          <Suspense loadingText={t("loading")}>
            {mode === "acme" ? (
              <CertificateApplyForm onSubmit={applySubmit.onSubmit} onSubmitError={applySubmit.onSubmitError} isPending={isPending} />
            ) : (
              <CertificateImportForm onSubmit={importSubmit.onSubmit} onSubmitError={importSubmit.onSubmitError} isPending={isPending} />
            )}
          </Suspense>
          <Section size="1" py="4" className={styles.side}>
            <Container size="2" px="4" width="100%">
              <Flex direction="column" gap="3">
                <Text size="1" color="gray">
                  {t("title")}
                </Text>
                <Text size="3">{mode === "acme" ? t("mode.acme") : t("mode.pem")}</Text>
                <Text size="2" color="gray">
                  {t("mode.acme")} · {t("mode.pem")}
                </Text>
              </Flex>
            </Container>
          </Section>
        </Grid>
      </PageFrame>
    </FormProvider>
  );
});

CertAddPage.displayName = "CertAddPage";

export default CertAddPage;

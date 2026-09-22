import { ArrowNarrowLeftIcon, FileDescriptionIcon } from "nfx-ui/icons";
import { memo, useState } from "react";
import { Button, Flex, SegmentedControl } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { PageHeader, Suspense } from "@/components";
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
          actions={
            <Flex gap="2" align="center">
              <SegmentedControl.Root value={mode} onValueChange={(value) => setMode(value as AddMode)}>
                <SegmentedControl.Item value="acme">{t("mode.acme")}</SegmentedControl.Item>
                <SegmentedControl.Item value="pem">{t("mode.pem")}</SegmentedControl.Item>
              </SegmentedControl.Root>
              <Button variant="ghost" onClick={handleBack}>
                <ArrowNarrowLeftIcon size={16} />
              </Button>
            </Flex>
          }
        />
        <Suspense loadingText={t("loading")}>
          {mode === "acme" ? (
            <CertificateApplyForm onSubmit={applySubmit.onSubmit} onSubmitError={applySubmit.onSubmitError} isPending={isPending} />
          ) : (
            <CertificateImportForm onSubmit={importSubmit.onSubmit} onSubmitError={importSubmit.onSubmitError} isPending={isPending} />
          )}
        </Suspense>
      </PageFrame>
    </FormProvider>
  );
});

CertAddPage.displayName = "CertAddPage";

export default CertAddPage;

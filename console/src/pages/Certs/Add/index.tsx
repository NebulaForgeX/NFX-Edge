import { AnimatedIcon, ArrowNarrowLeftIcon, FileDescriptionIcon, RocketIcon, UploadIcon } from "nfx-ui/icons";
import { memo, useState } from "react";
import { Badge, Button, Card, Flex, Grid, Heading, SegmentedControl, Separator, Text } from "@radix-ui/themes";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ActionBar, PageHeader, Suspense } from "@/components";
import { routerEventEmitter } from "@/events/router";
import {
  CertificateApplyForm,
  CertificateImportForm,
  useInitApplyCertificateForm,
  useInitManualCertificateForm,
  useSubmitCertificate,
  useSubmitManualCertificate,
} from "@/features/certificate";
import { PageFrame } from "@/layouts";

import styles from "./s.module.css";

type AddMode = "acme" | "pem";

const MODE_ICON = { acme: RocketIcon, pem: UploadIcon } as const;
const MODES: AddMode[] = ["acme", "pem"];

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
        <PageHeader icon={FileDescriptionIcon} index={t("index")} title={t("title")} description={t("subtitle")} />
        <ActionBar
          status={
            <SegmentedControl.Root value={mode} onValueChange={(value) => setMode(value as AddMode)}>
              <SegmentedControl.Item value="acme">{t("mode.acme")}</SegmentedControl.Item>
              <SegmentedControl.Item value="pem">{t("mode.pem")}</SegmentedControl.Item>
            </SegmentedControl.Root>
          }
        >
          <Button variant="outline" color="gray" onClick={handleBack}>
            <ArrowNarrowLeftIcon size={16} />
            {t("back")}
          </Button>
        </ActionBar>
        <Grid columns={{ initial: "1", lg: "minmax(0, 1fr) 18rem" }} gap="5" align="start">
          <Suspense loadingText={t("loading")}>
            {mode === "acme" ? (
              <CertificateApplyForm onSubmit={applySubmit.onSubmit} onSubmitError={applySubmit.onSubmitError} isPending={isPending} />
            ) : (
              <CertificateImportForm onSubmit={importSubmit.onSubmit} onSubmitError={importSubmit.onSubmitError} isPending={isPending} />
            )}
          </Suspense>
          <Card size="3" variant="surface">
            <Flex direction="column" gap="4">
              <Heading as="h2" size="2" weight="medium" color="gray">
                {t("side.title")}
              </Heading>
              {MODES.map((item, index) => {
                const active = item === mode;
                return (
                  <Flex key={item} direction="column" gap="4">
                    {index > 0 ? <Separator size="4" /> : null}
                    <Flex gap="3" align="start">
                      <Flex align="center" justify="center" flexShrink="0" className={styles.stamp} data-active={active ? "true" : "false"}>
                        <AnimatedIcon icon={MODE_ICON[item]} size={18} />
                      </Flex>
                      <Flex direction="column" gap="1" minWidth="0">
                        <Flex align="center" gap="2" wrap="wrap">
                          <Text size="2" weight="bold">
                            {t(`mode.${item}`)}
                          </Text>
                          {active ? (
                            <Badge size="1" variant="surface" radius="full">
                              {t("side.active")}
                            </Badge>
                          ) : null}
                        </Flex>
                        <Text size="1" color="gray">
                          {t(`mode.${item}Hint`)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>
          </Card>
        </Grid>
      </PageFrame>
    </FormProvider>
  );
});

CertAddPage.displayName = "CertAddPage";

export default CertAddPage;

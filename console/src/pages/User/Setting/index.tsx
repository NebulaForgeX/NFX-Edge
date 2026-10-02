import { GearIcon } from "nfx-ui/icons";
import type { ReactNode } from "react";

import { Button, Flex, Grid, Heading, Section, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ActionBar, PageHeader, Suspense } from "@/components";
import { routerEventEmitter } from "@/events/router";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";

import { SystemSettings, ThemeSettings } from "./components";

function SettingsSection({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return (
    <Section size="1" aria-labelledby={id}>
      <Section pt="0" pb="3">
      <Flex direction="column" gap="1">
        <Heading as="h2" id={id} size="4">
          {title}
        </Heading>
        <Text as="p" size="2" color="gray">
          {description}
        </Text>
      </Flex>
      </Section>
      {children}
    </Section>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation("pages.User.Setting");

  return (
    <PageFrame>
      <PageHeader icon={GearIcon} index={t("index")} title={t("title")} description={t("description")} />
      <ActionBar>
        <Button size="2" variant="outline" onClick={() => routerEventEmitter.navigate({ to: ROUTES.USER_PROFILE_OVERVIEW })}>
          {t("actions.openProfile")}
        </Button>
      </ActionBar>

      <Grid columns={{ initial: "1", xl: "minmax(0, 1.4fr) minmax(18rem, 0.6fr)" }} gap="8" width="100%" align="start">
        <SettingsSection id="settings-theme" title={t("sections.theme.title")} description={t("sections.theme.description")}>
          <ThemeSettings />
        </SettingsSection>

        <SettingsSection id="settings-system" title={t("sections.system.title")} description={t("sections.system.description")}>
          <Suspense>
            <SystemSettings />
          </Suspense>
        </SettingsSection>
      </Grid>
    </PageFrame>
  );
}

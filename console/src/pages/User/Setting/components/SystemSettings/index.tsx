import { FilledBellIcon, SaveIcon } from "nfx-ui/icons";
import { useEffect, useState } from "react";
import { Button, Card, Flex, Section, Switch, Text } from "@radix-ui/themes";
import { useCurrentProfile, useUpdateProfileSettings } from "nfx-ui/hooks";
import { useTranslation } from "react-i18next";

import styles from "./s.module.css";

export default function SystemSettings() {
  const { t } = useTranslation("pages.User.Setting", {
    keyPrefix: "systemSettings",
  });
  const { profile } = useCurrentProfile();
  const update = useUpdateProfileSettings({ successMsg: t("saveSuccess") });
  const [loginNotification, setLoginNotification] = useState(true);

  useEffect(() => {
    if (profile?.settings) {
      setLoginNotification(profile.settings.loginNotification);
      return;
    }
    setLoginNotification(true);
  }, [profile]);

  const baseline = profile?.settings?.loginNotification ?? true;
  const dirty = loginNotification !== baseline;

  return (
    <Card size="3" variant="surface">
      <Flex direction="column" gap="4">
        <Text as="label" size="2" weight="medium">
          <Flex align="center" justify="between" gap="3">
            <Flex align="center" gap="2">
              <FilledBellIcon size={14} />
              {t("loginEmailNotification")}
            </Flex>
            <Switch checked={loginNotification} onCheckedChange={setLoginNotification} />
          </Flex>
        </Text>
        <Text as="p" size="1" color="gray">
          {t("loginEmailNotificationDesc")}
        </Text>
        <Section size="1" pt="4" pb="0" className={styles.footer}>
          <Flex justify="end" gap="2">
            <Button size="2" disabled={!dirty || update.isPending} loading={update.isPending} onClick={() => update.mutate({ loginNotification })}>
              <SaveIcon size={14} />
              {t("save")}
            </Button>
          </Flex>
        </Section>
      </Flex>
    </Card>
  );
}

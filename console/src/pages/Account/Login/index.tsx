import { AnimatedIcon, ArrowNarrowRightIcon, RightChevron } from "nfx-ui/icons";
import type { Login } from "nfx-ui/types";
import type { ReactNode } from "react";

import { useMemo, useState } from "react";

import { Badge, Box, Button, Flex, Heading, Link, Section, Spinner, Tabs, Text } from "@radix-ui/themes";
import { APP_NAME } from "nfx-ui/config";
import { ProfileKind, ProfileKindEnum } from "nfx-ui/enums";
import { useLoginWithEmail, useLoginWithPhone, useSelectProfile } from "nfx-ui/hooks";
import { LoginFormData, LoginWithPhoneFormData, useInitLoginForm, useInitLoginWithPhoneForm } from "nfx-ui/schemas";
import { FormProvider, SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { LoginEmailController, LoginPasswordController, LoginPhoneController, LoginRememberController } from "@/features/account";
import { ROUTES } from "@/navigations";
import { resolveAccountDisplayName, safeArray, safeOr, safeStringable } from "@/utils";

import LoginShell from "./LoginShell";
import styles from "./s.module.css";

function ProtocolStep({ n, children }: { n: string; children: ReactNode }) {
  return (
    <Flex align="start" gap="4" width="100%">
      <Section size="1" pt="5" pb="0">
        <Flex className={styles.stepNum} align="center" justify="center" flexShrink="0" width="2rem" height="2rem">
          {n}
        </Flex>
      </Section>
      <Box width="100%" minWidth="0">
        {children}
      </Box>
    </Flex>
  );
}

export default function LoginPage() {
  const { t } = useTranslation("pages.Account.Login");
  const emailForm = useInitLoginForm();
  const phoneForm = useInitLoginWithPhoneForm();
  const loginEmail = useLoginWithEmail();
  const loginPhone = useLoginWithPhone();
  const selectProfile = useSelectProfile();
  const [profiles, setProfiles] = useState<Login.ProfileItem[]>([]);
  const [channel, setChannel] = useState<"email" | "phone">("email");

  const finishLogin = (result: Login.Response.LoginWithEmail) => {
    const list = safeArray(result?.profiles);
    if (list.length > 0) {
      setProfiles(list);
      return;
    }
    routerEventEmitter.navigate({ to: ROUTES.USER_OVERVIEW, replace: true });
  };

  const onEmail: SubmitHandler<LoginFormData> = async (data) => {
    const result = await loginEmail.mutateAsync({
      email: data.email,
      password: data.password,
      rememberMe: safeOr(data.rememberMe, false),
    });
    finishLogin(result);
  };

  const onPhone: SubmitHandler<LoginWithPhoneFormData> = async (data) => {
    const result = await loginPhone.mutateAsync({
      phone: data.phone,
      password: data.password,
      rememberMe: safeOr(data.rememberMe, false),
    });
    finishLogin(result);
  };

  const rows = useMemo(() => profiles.filter((profile) => profile.profileId), [profiles]);
  const selecting = rows.length > 0;

  const chooseProfile = async (profile: Login.ProfileItem) => {
    if (selectProfile.isPending) return;
    await selectProfile.mutateAsync({
      profileId: profile.profileId,
      kind: ProfileKind(profile.kind),
    });
    routerEventEmitter.navigate({ to: ROUTES.USER_OVERVIEW, replace: true });
  };

  return (
    <LoginShell>
      {selecting ? (
        <Flex direction="column" gap="6" width="100%">
          <Flex direction="column" gap="3">
            <Text as="span" size="1" weight="bold" className={styles.index}>
              {t("selectProfile.eyebrow")}
            </Text>
            <Heading as="h1" size={{ initial: "8", lg: "9" }} weight="bold" m="0">
              {t("selectProfile.title")}
            </Heading>
            <Text as="p" size="2" color="gray" m="0" className={styles.lede}>
              {t("selectProfile.subtitle")}
            </Text>
          </Flex>
          <Flex direction="column">
            {rows.map((profile) => {
              const kind = ProfileKind(profile.kind);
              const isAuthority = kind === ProfileKindEnum.AUTHORITY;
              const name = resolveAccountDisplayName(profile.displayName, profile.profileId);
              const kindLabel = t(`selectProfile.kind.${kind}`);
              const place = [safeStringable(profile.city), safeStringable(profile.country)].filter(Boolean).join(", ");
              return (
                <Section key={`${kind}:${profile.profileId}`} size="1" py="3" className={styles.profileRule}>
                  <Flex align="center" justify="between" gap="3">
                    <Flex align="center" gap="3" minWidth="0">
                      <Badge color={isAuthority ? "amber" : "gray"} variant="outline" size="1">
                        {kindLabel}
                      </Badge>
                      <Flex direction="column" gap="1" minWidth="0">
                        <Text size="2" weight="bold">
                          {name}
                        </Text>
                        {place ? (
                          <Text size="1" color="gray">
                            {place}
                          </Text>
                        ) : null}
                      </Flex>
                    </Flex>
                    <Button size="1" variant="outline" disabled={selectProfile.isPending} onClick={() => void chooseProfile(profile)}>
                      {selectProfile.isPending ? <Spinner size="1" /> : <AnimatedIcon icon={RightChevron} size={14} />}
                    </Button>
                  </Flex>
                </Section>
              );
            })}
          </Flex>
          <Button type="button" variant="ghost" color="gray" size="2" onClick={() => setProfiles([])} disabled={selectProfile.isPending}>
            {t("selectProfile.back")}
          </Button>
        </Flex>
      ) : (
        <Flex direction="column" gap="6" width="100%">
          <Flex direction="column" gap="3">
            <Text as="span" size="1" weight="bold" className={styles.index}>
              {t("protocol.kicker")}
            </Text>
            <Heading as="h1" size={{ initial: "8", lg: "9" }} weight="bold" m="0">
              {t("protocol.title")}
            </Heading>
            <Text as="p" size="2" color="gray" m="0" className={styles.lede}>
              {t("protocol.subtitle")}
            </Text>
          </Flex>

          <Tabs.Root value={channel} onValueChange={(value) => setChannel(value as "email" | "phone")}>
            <Tabs.List>
              <Tabs.Trigger value="email">{t("form.channelEmail")}</Tabs.Trigger>
              <Tabs.Trigger value="phone">{t("form.channelPhone")}</Tabs.Trigger>
            </Tabs.List>
            <Section size="1" pt="5" pb="0">
              <Tabs.Content value="email">
                <FormProvider {...emailForm}>
                  <Flex asChild direction="column" gap="5">
                    <form noValidate onSubmit={emailForm.handleSubmit(onEmail)}>
                      <ProtocolStep n={t("protocol.stepEmail")}>
                        <LoginEmailController />
                      </ProtocolStep>
                      <ProtocolStep n={t("protocol.stepPassword")}>
                        <LoginPasswordController />
                      </ProtocolStep>
                      <ProtocolStep n={t("protocol.stepEnter")}>
                        <Flex direction="column" gap="4">
                          <LoginRememberController />
                          <Button type="submit" size="3" className={styles.submit} loading={loginEmail.isPending}>
                            {t("form.submit")}
                            <AnimatedIcon icon={ArrowNarrowRightIcon} size={16} />
                          </Button>
                        </Flex>
                      </ProtocolStep>
                    </form>
                  </Flex>
                </FormProvider>
              </Tabs.Content>
              <Tabs.Content value="phone">
                <FormProvider {...phoneForm}>
                  <Flex asChild direction="column" gap="5">
                    <form noValidate onSubmit={phoneForm.handleSubmit(onPhone)}>
                      <ProtocolStep n={t("protocol.stepEmail")}>
                        <LoginPhoneController />
                      </ProtocolStep>
                      <ProtocolStep n={t("protocol.stepPassword")}>
                        <LoginPasswordController />
                      </ProtocolStep>
                      <ProtocolStep n={t("protocol.stepEnter")}>
                        <Flex direction="column" gap="4">
                          <LoginRememberController />
                          <Button type="submit" size="3" className={styles.submit} loading={loginPhone.isPending}>
                            {t("form.submit")}
                            <AnimatedIcon icon={ArrowNarrowRightIcon} size={16} />
                          </Button>
                        </Flex>
                      </ProtocolStep>
                    </form>
                  </Flex>
                </FormProvider>
              </Tabs.Content>
            </Section>
          </Tabs.Root>

          <Text as="p" size="2" color="gray">
            {t("promo.newTo", { name: APP_NAME })}{" "}
            <Link
              href={ROUTES.SIGNUP}
              size="2"
              onClick={(e) => {
                e.preventDefault();
                routerEventEmitter.navigate({ to: ROUTES.SIGNUP });
              }}
            >
              {t("promo.createAccount")}
            </Link>
          </Text>
        </Flex>
      )}
    </LoginShell>
  );
}

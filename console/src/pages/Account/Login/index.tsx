import { AnimatedIcon, ArrowNarrowRightIcon, RightChevron } from "nfx-ui/icons";
import type { Login } from "nfx-ui/types";

import { useMemo, useState } from "react";
import { Badge, Box, Button, Flex, Heading, IconButton, Link, SegmentedControl, Section, Spinner, Table, Text } from "@radix-ui/themes";
import { APP_NAME } from "nfx-ui/config";
import { ProfileKind, ProfileKindEnum } from "nfx-ui/enums";
import { useLoginWithEmail, useLoginWithPhone, useSelectProfile } from "nfx-ui/hooks";
import { LoginFormData, LoginWithPhoneFormData, useInitLoginForm, useInitLoginWithPhoneForm } from "nfx-ui/schemas";
import { FormProvider, SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { LoginChannel, LoginChannelEnum } from "@/enums";
import { routerEventEmitter } from "@/events/router";
import { LoginEmailController, LoginPasswordController, LoginPhoneController, LoginRememberController } from "@/features/account";
import { ROUTES } from "@/navigations";
import AuthShell from "@/pages/Account/shared/AuthShell";
import { resolveAccountDisplayName, safeArray, safeOr, safeStringable } from "@/utils";

import CertificatePanel from "./CertificatePanel";
import styles from "./s.module.css";

export default function LoginPage() {
  const { t } = useTranslation("pages.Account.Login");
  const emailForm = useInitLoginForm(t);
  const phoneForm = useInitLoginWithPhoneForm(t);
  const loginEmail = useLoginWithEmail();
  const loginPhone = useLoginWithPhone();
  const selectProfile = useSelectProfile({
    switchingMsg: t("selectProfile.switching"),
    onCommit: () => {
      routerEventEmitter.navigate({ to: ROUTES.CERTS_OVERVIEW, replace: true });
    },
  });
  const [profiles, setProfiles] = useState<Login.ProfileItem[]>([]);
  const [channel, setChannel] = useState(LoginChannelEnum.EMAIL);

  const finishLogin = (result: Login.Response.LoginWithEmail) => {
    const list = safeArray(result?.profiles);
    if (list.length > 0) {
      setProfiles(list);
      return;
    }
    routerEventEmitter.navigate({ to: ROUTES.CERTS_OVERVIEW, replace: true });
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
      kind: profile.kind,
    });
  };

  const fieldIndex = (value: string) => (
    <Text as="span" className={styles.fieldIndex}>
      {value}
    </Text>
  );

  const unlockTail = (pending: boolean) => (
    <>
      <LoginPasswordController labelAside={fieldIndex(t("protocol.stepPassword"))} />
      <Flex align="center" justify="between" gap="3">
        <LoginRememberController />
        {fieldIndex(t("protocol.stepEnter"))}
      </Flex>
      <Button type="submit" size="3" className={styles.submit} loading={pending}>
        {t("form.submit")}
        <AnimatedIcon icon={ArrowNarrowRightIcon} size={16} />
      </Button>
    </>
  );

  return (
    <AuthShell product={t("rail.product")} aside={<CertificatePanel />}>
      {selecting ? (
        <Flex direction="column" gap="5" width="100%">
          <Flex direction="column" gap="2" className="js-auth-item">
            <Text as="span" className={styles.kicker}>
              {t("selectProfile.eyebrow")}
            </Text>
            <Heading as="h1" size="7" weight="bold" className={styles.title}>
              {t("selectProfile.title")}
            </Heading>
            <Text as="p" size="2" color="gray" className={styles.lede}>
              {t("selectProfile.subtitle")}
            </Text>
          </Flex>

          <Table.Root variant="surface" size="1" className="js-auth-item">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>{t("selectProfile.colKind")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>{t("selectProfile.colName")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>{t("selectProfile.colId")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((profile) => {
                const kind = ProfileKind(profile.kind);
                const isAuthority = kind === ProfileKindEnum.AUTHORITY;
                const name = resolveAccountDisplayName(profile.displayName, profile.profileId);
                const place = [safeStringable(profile.city), safeStringable(profile.country)].filter(Boolean).join(", ");
                return (
                  <Table.Row key={`${kind}:${profile.profileId}`} align="center" className={styles.profileRow} onClick={() => void chooseProfile(profile)}>
                    <Table.Cell>
                      <Badge color={isAuthority ? "amber" : "gray"} variant="outline" size="1">
                        {t(`selectProfile.kind.${kind}`)}
                      </Badge>
                    </Table.Cell>
                    <Table.RowHeaderCell>
                      <Flex direction="column" minWidth="0">
                        <Text size="2" weight="medium" truncate>
                          {name}
                        </Text>
                        {place ? (
                          <Text size="1" color="gray" truncate>
                            {place}
                          </Text>
                        ) : null}
                      </Flex>
                    </Table.RowHeaderCell>
                    <Table.Cell>
                      <Text as="span" className={styles.profileId} title={profile.profileId}>
                        {profile.profileId}
                      </Text>
                    </Table.Cell>
                    <Table.Cell justify="end">
                      <IconButton
                        type="button"
                        size="1"
                        variant="outline"
                        aria-label={name}
                        disabled={selectProfile.isPending}
                        onClick={(event) => {
                          event.stopPropagation();
                          void chooseProfile(profile);
                        }}
                      >
                        {selectProfile.isPending ? <Spinner size="1" /> : <AnimatedIcon icon={RightChevron} size={14} />}
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>

          <Button type="button" variant="outline" color="gray" size="2" className="js-auth-item" onClick={() => setProfiles([])} disabled={selectProfile.isPending}>
            {t("selectProfile.back")}
          </Button>
        </Flex>
      ) : (
        <Flex direction="column" gap="6" width="100%">
          <Flex direction="column" gap="2" className="js-auth-item">
            <Text as="span" className={styles.kicker}>
              {t("protocol.kicker")}
            </Text>
            <Heading as="h1" size="7" weight="bold" className={styles.title}>
              {t("protocol.title")}
            </Heading>
            <Text as="p" size="2" color="gray" className={styles.lede}>
              {t("protocol.subtitle")}
            </Text>
          </Flex>

          <Flex direction="column" gap="5" className="js-auth-item">
            <SegmentedControl.Root value={channel} onValueChange={(value) => setChannel(LoginChannel(value))} size="2" className={styles.channel}>
              <SegmentedControl.Item value={LoginChannelEnum.EMAIL}>{t("form.channelEmail")}</SegmentedControl.Item>
              <SegmentedControl.Item value={LoginChannelEnum.PHONE}>{t("form.channelPhone")}</SegmentedControl.Item>
            </SegmentedControl.Root>

            {channel === LoginChannelEnum.EMAIL ? (
              <FormProvider {...emailForm}>
                <Flex asChild direction="column" gap="4">
                  <form noValidate onSubmit={emailForm.handleSubmit(onEmail)}>
                    <LoginEmailController labelAside={fieldIndex(t("protocol.stepEmail"))} />
                    {unlockTail(loginEmail.isPending)}
                  </form>
                </Flex>
              </FormProvider>
            ) : (
              <FormProvider {...phoneForm}>
                <Flex asChild direction="column" gap="4">
                  <form noValidate onSubmit={phoneForm.handleSubmit(onPhone)}>
                    <LoginPhoneController labelAside={fieldIndex(t("protocol.stepEmail"))} />
                    {unlockTail(loginPhone.isPending)}
                  </form>
                </Flex>
              </FormProvider>
            )}
          </Flex>

          <Section size="1" pt="4" pb="0" className={`${styles.foot} js-auth-item`}>
            <Flex align="center" justify="between" gap="3">
              <Text as="p" size="2" color="gray">
                {t("promo.newTo", { name: APP_NAME })}
              </Text>
              <Link
                href={ROUTES.SIGNUP}
                size="2"
                weight="medium"
                onClick={(e) => {
                  e.preventDefault();
                  routerEventEmitter.navigate({ to: ROUTES.SIGNUP });
                }}
              >
                {t("promo.createAccount")}
              </Link>
            </Flex>
          </Section>

          <Box display={{ initial: "block", md: "none" }}>
            <Text as="p" className={styles.summary}>
              {t("facsimile.summary")}
            </Text>
          </Box>
        </Flex>
      )}
    </AuthShell>
  );
}

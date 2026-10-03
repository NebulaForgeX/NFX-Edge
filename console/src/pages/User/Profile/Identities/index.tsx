import { ArrowNarrowLeftIcon, UsersIcon } from "nfx-ui/icons";
import type { Profile } from "nfx-ui/types";

import { useState } from "react";
import { Avatar, Badge, Box, Button, Card, Container, Flex, Grid, Heading, Section, Select, Text, TextField } from "@radix-ui/themes";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { LanguageEnum, ProfileKindEnum } from "nfx-ui/enums";
import {
  useChangePassword,
  useCreateForgerProfile,
  useCreateEmail,
  useCreatePhone,
  useDeleteEmail,
  useDeletePhone,
  useDeleteProfile,
  useListEmails,
  useListPhones,
  useListProfiles,
  useSelectProfile,
  useSendChangePasswordVerificationCode,
  useSendEmailVerificationCode,
  useSendPhoneVerificationCode,
  useSetPrimaryEmail,
  useSetPrimaryPhone,
  useUpdateEmail,
  useUpdatePhone,
  useVerifyEmail,
  useVerifyPhone,
} from "nfx-ui/hooks";
import { useAuthStore, usePreferenceStore } from "nfx-ui/stores";
import { isVerificationCodeComplete, normalizeVerificationCode } from "nfx-ui/utils";
import { useTranslation } from "react-i18next";

import { ActionBar, EmptyState, PageHeader, Suspense } from "@/components";
import { routerEventEmitter } from "@/events/router";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";
import { showConfirm } from "@/stores/modal";
import { buildAvatarImageSrc, safeArray, safeStringable } from "@/utils";

import styles from "./s.module.css";

type SectionId = "emails" | "phones" | "password" | "profiles";

type IdentityRow = {
  profileId: string;
  displayName: Nullable<string>;
  kind: ProfileKindEnum;
  avatarImageId: Nullable<string>;
};

function toCommunityRow(item: Profile.Response.ForgerProfileItem): IdentityRow {
  return {
    profileId: item.profileId,
    displayName: item.displayName,
    kind: ProfileKindEnum.COMMUNITY,
    avatarImageId: item.avatarImageId,
  };
}

function toAuthorityRow(item: Profile.Response.AuthorityProfileItem): IdentityRow {
  return {
    profileId: item.profileId,
    displayName: item.displayName,
    kind: ProfileKindEnum.AUTHORITY,
    avatarImageId: item.avatarImageId,
  };
}

function SectionHead({ title, description }: { title: string; description: string }) {
  return (
    <Flex direction="column" gap="1">
      <Heading as="h3" size="4" weight="bold">
        {title}
      </Heading>
      <Text as="p" size="2" color="gray">
        {description}
      </Text>
    </Flex>
  );
}

function EmailRow({
  item,
}: {
  item: {
    id: string;
    email: string;
    isPrimary: boolean;
    verifiedAt: Nilable<string>;
  };
}) {
  const { t } = useTranslation("pages.User.Profile.Identities");
  const deleteEmail = useDeleteEmail({ successMsg: t("toasts.deleteEmailSuccess") });
  const setPrimary = useSetPrimaryEmail({ successMsg: t("toasts.setPrimaryEmailSuccess") });
  const sendCode = useSendEmailVerificationCode({ successMsg: t("toasts.sendVerificationCodeSuccess") });
  const verify = useVerifyEmail({ successMsg: t("toasts.verifyEmailSuccess") });
  const updateEmail = useUpdateEmail({ successMsg: t("toasts.updateEmailSuccess") });
  const [code, setCode] = useState("");
  const [nextEmail, setNextEmail] = useState(item.email);
  const [editing, setEditing] = useState(false);
  const verified = Boolean(item.verifiedAt);

  return (
    <Flex direction="column" gap="3">
      <Flex direction="column" gap="3">
        <Flex align="center" gap="2" wrap="wrap" minWidth="0">
          <Text size="2" weight="bold" className={styles.mono}>
            {item.email}
          </Text>
          {item.isPrimary ? (
            <Badge variant="surface" radius="full">
              {t("labels.primary")}
            </Badge>
          ) : null}
          <Badge variant="surface" radius="full" color={verified ? "green" : "amber"}>
            {verified ? t("labels.verified") : t("labels.unverified")}
          </Badge>
        </Flex>
        <Flex gap="2" wrap="wrap" align="center">
            {!verified ? (
              <Button size="1" variant="outline" color="gray" loading={sendCode.isPending} onClick={() => sendCode.mutate({ emailId: item.id })}>
                {t("actions.sendCode")}
              </Button>
            ) : null}
            {!item.isPrimary ? (
              <Button size="1" variant="outline" color="gray" onClick={() => setPrimary.mutate(item.id)}>
                {t("actions.setPrimary")}
              </Button>
            ) : null}
            <Button size="1" variant="outline" color="gray" onClick={() => setEditing((v) => !v)}>
              {editing ? t("actions.cancelEdit") : t("actions.editEmail")}
            </Button>
            <Button size="1" variant="outline" color="red" onClick={() => deleteEmail.mutate(item.id)}>
              {t("actions.remove")}
            </Button>
          </Flex>

        {editing ? (
          <Flex direction="column" gap="2">
            <Text size="1" weight="medium" color="gray">
              {t("labels.newEmail")}
            </Text>
            <Flex align="center" justify="between" gap="3" wrap="wrap">
              <Box minWidth="0" >
                <TextField.Root size="2" value={nextEmail} onChange={(e) => setNextEmail(e.target.value)} />
              </Box>
              <Button size="1"
                loading={updateEmail.isPending}
                disabled={!nextEmail.trim() || nextEmail.trim() === item.email}
                onClick={() => updateEmail.mutate({ emailId: item.id, email: nextEmail.trim() }, { onSuccess: () => setEditing(false) })}
              >
                {t("actions.saveEmail")}
              </Button>
            </Flex>
          </Flex>
        ) : null}

        {!verified ? (
          <Flex direction="column" gap="2">
            <Text size="1" weight="medium" color="gray">
              {t("labels.verificationCode")}
            </Text>
            <Flex align="center" justify="between" gap="3" wrap="wrap">
              <Box minWidth="0" >
                <TextField.Root size="2" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("labels.verificationCode")} />
              </Box>
              <Button size="1"
                loading={verify.isPending}
                disabled={!code.trim()}
                onClick={() => verify.mutate({ emailId: item.id, verificationCode: code.trim() }, { onSuccess: () => setCode("") })}
              >
                {t("actions.verify")}
              </Button>
            </Flex>
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
}

function EmailsSection() {
  const { t } = useTranslation("pages.User.Profile.Identities");
  const emails = useListEmails();
  const createEmail = useCreateEmail({ successMsg: t("toasts.createEmailSuccess") });
  const [newEmail, setNewEmail] = useState("");
  const emailItems = safeArray(emails.data?.items);

  return (
    <Flex direction="column" gap="3">
      <Flex direction="column" gap="3">
        <Flex direction="column" gap="3">
          <SectionHead title={t("sections.emails.title")} description={t("sections.emails.description")} />
          {emailItems.length ? null : <EmptyState icon={UsersIcon} title={t("empty.emails.title")} description={t("empty.emails.description")} />}
          <Flex direction="column" gap="2">
            <Text size="1" weight="medium" color="gray">
              {t("labels.emailPlaceholder")}
            </Text>
            <Flex align="center" justify="between" gap="3" wrap="wrap">
              <Box minWidth="0" >
                <TextField.Root size="2" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={t("labels.emailPlaceholder")} />
              </Box>
              <Button size="2" onClick={() => createEmail.mutate({ email: newEmail }, { onSuccess: () => setNewEmail("") })}>
                {t("actions.addEmail")}
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      {emailItems.map((item) => (
        <Card key={item.id} size="2" variant="surface">
          <EmailRow item={item} />
        </Card>
      ))}
    </Flex>
  );
}

function PhoneRow({
  item,
}: {
  item: {
    id: string;
    phone: string;
    isPrimary: boolean;
    verifiedAt: Nilable<string>;
  };
}) {
  const { t } = useTranslation("pages.User.Profile.Identities");
  const deletePhone = useDeletePhone({ successMsg: t("toasts.deletePhoneSuccess") });
  const setPrimary = useSetPrimaryPhone({ successMsg: t("toasts.setPrimaryPhoneSuccess") });
  const sendCode = useSendPhoneVerificationCode({ successMsg: t("toasts.sendVerificationCodeSuccess") });
  const verify = useVerifyPhone({ successMsg: t("toasts.verifyPhoneSuccess") });
  const updatePhone = useUpdatePhone({ successMsg: t("toasts.updatePhoneSuccess") });
  const [code, setCode] = useState("");
  const [nextPhone, setNextPhone] = useState(item.phone);
  const [editing, setEditing] = useState(false);
  const verified = Boolean(item.verifiedAt);

  return (
    <Flex direction="column" gap="3">
      <Flex align="center" gap="2" wrap="wrap" minWidth="0">
        <Text size="2" weight="bold" className={styles.mono}>
          {item.phone}
        </Text>
        {item.isPrimary ? (
          <Badge variant="surface" radius="full">
            {t("labels.primary")}
          </Badge>
        ) : null}
        <Badge variant="surface" radius="full" color={verified ? "green" : "amber"}>
          {verified ? t("labels.verified") : t("labels.unverified")}
        </Badge>
      </Flex>
      <Flex gap="2" wrap="wrap" align="center">
        {!verified ? (
          <Button size="1" variant="outline" color="gray" loading={sendCode.isPending} onClick={() => sendCode.mutate(item.id)}>
            {t("actions.sendCode")}
          </Button>
        ) : null}
        {!item.isPrimary ? (
          <Button size="1" variant="outline" color="gray" onClick={() => setPrimary.mutate(item.id)}>
            {t("actions.setPrimary")}
          </Button>
        ) : null}
        <Button size="1" variant="outline" color="gray" onClick={() => setEditing((v) => !v)}>
          {editing ? t("actions.cancelEdit") : t("actions.editPhone")}
        </Button>
        <Button size="1" variant="outline" color="red" onClick={() => deletePhone.mutate(item.id)}>
          {t("actions.remove")}
        </Button>
      </Flex>
      {editing ? (
        <Flex direction="column" gap="2">
          <Text size="1" color="gray">
            {t("labels.newPhone")}
          </Text>
          <Flex align="center" gap="3" wrap="wrap">
            <Box minWidth="0" >
              <TextField.Root size="2" value={nextPhone} onChange={(e) => setNextPhone(e.target.value)} />
            </Box>
            <Button
              size="1"
              loading={updatePhone.isPending}
              disabled={!nextPhone.trim() || nextPhone.trim() === item.phone}
              onClick={() => updatePhone.mutate({ phoneId: item.id, phone: nextPhone.trim() }, { onSuccess: () => setEditing(false) })}
            >
              {t("actions.savePhone")}
            </Button>
          </Flex>
        </Flex>
      ) : null}
      {!verified ? (
        <Flex direction="column" gap="2">
          <Text size="1" color="gray">
            {t("labels.verificationCode")}
          </Text>
          <Flex align="center" gap="3" wrap="wrap">
            <Box minWidth="0" >
              <TextField.Root
                size="2"
                value={code}
                onChange={(e) => setCode(normalizeVerificationCode(e.target.value))}
                placeholder={t("labels.verificationCodePlaceholder")}
              />
            </Box>
            <Button
              size="1"
              loading={verify.isPending}
              disabled={!isVerificationCodeComplete(code)}
              onClick={() => verify.mutate({ phoneId: item.id, verificationCode: normalizeVerificationCode(code) }, { onSuccess: () => setCode("") })}
            >
              {t("actions.verify")}
            </Button>
          </Flex>
        </Flex>
      ) : null}
    </Flex>
  );
}

function PhonesSection() {
  const { t } = useTranslation("pages.User.Profile.Identities");
  const phones = useListPhones();
  const createPhone = useCreatePhone({ successMsg: t("toasts.createPhoneSuccess") });
  const [newPhone, setNewPhone] = useState("");
  const items = safeArray(phones.data?.items);

  return (
    <Flex direction="column" gap="3">
      <SectionHead title={t("sections.phones.title")} description={t("sections.phones.description")} />
      {items.length ? null : <EmptyState icon={UsersIcon} title={t("empty.phones.title")} description={t("empty.phones.description")} />}
      <Flex direction="column" gap="2">
        <Text size="1" color="gray">
          {t("labels.phonePlaceholder")}
        </Text>
        <Flex align="center" gap="3" wrap="wrap">
          <Box minWidth="0" >
            <TextField.Root size="2" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder={t("labels.phonePlaceholder")} />
          </Box>
          <Button size="2" onClick={() => createPhone.mutate({ phone: newPhone }, { onSuccess: () => setNewPhone("") })}>
            {t("actions.addPhone")}
          </Button>
        </Flex>
      </Flex>
      {items.map((item) => (
        <Card key={item.id} size="2" variant="surface">
          <PhoneRow item={item} />
        </Card>
      ))}
    </Flex>
  );
}

function PasswordSection() {
  const { t } = useTranslation("pages.User.Profile.Identities");
  const currentLanguage = usePreferenceStore((s) => s.language);
  const changePassword = useChangePassword({ successMsg: t("toasts.changePasswordSuccess") });
  const sendCode = useSendChangePasswordVerificationCode({ successMsg: t("toasts.sendVerificationCodeSuccess") });
  const emails = useListEmails();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const primaryEmail = safeArray(emails.data?.items).find((e) => e.isPrimary)?.email;
  const busy = changePassword.isPending || sendCode.isPending;
  const canSubmit = currentPassword.length > 0 && newPassword.length >= 8 && isVerificationCodeComplete(verificationCode) && !busy;

  return (
    <Flex direction="column" gap="3">
      <Flex direction="column" gap="3">
        <SectionHead title={t("sections.password.title")} description={t("sections.password.description")} />
        <Flex direction="column" gap="2">
          <Text size="1" weight="medium" color="gray">
            {t("labels.currentPassword")}
          </Text>
          <TextField.Root
            size="2"
            type="password"
            value={currentPassword}
            disabled={busy}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t("labels.currentPassword")}
          />
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="1" weight="medium" color="gray">
            {t("labels.newPassword")}
          </Text>
          <TextField.Root size="2" type="password" value={newPassword} disabled={busy} onChange={(e) => setNewPassword(e.target.value)} placeholder={t("labels.newPassword")} />
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="1" weight="medium" color="gray">
            {t("labels.verificationCode")}
          </Text>
          <Text size="1" color="gray">
            {primaryEmail ? t("labels.passwordSendCodeHint", { email: primaryEmail }) : t("labels.passwordSendCodeHintNoEmail")}
          </Text>
          <Flex gap="2" align="center">
            <Box minWidth="0" >
              <TextField.Root
                size="2"
                autoComplete="one-time-code"
                value={verificationCode}
                disabled={busy}
                onChange={(e) => setVerificationCode(normalizeVerificationCode(e.target.value))}
                placeholder={t("labels.verificationCodePlaceholder")}
              />
            </Box>
            <Button
              type="button"
              size="2"
              variant="outline" color="gray"
              loading={sendCode.isPending}
              disabled={busy || !primaryEmail}
              onClick={() =>
                void sendCode.mutateAsync({
                  lang: currentLanguage ?? LanguageEnum.EN,
                })
              }
            >
              {t("actions.sendCode")}
            </Button>
          </Flex>
        </Flex>
        <Section size="1" py="2">
          <Flex align="center" justify="end" gap="3">
          <Button size="2"
            loading={changePassword.isPending}
            disabled={!canSubmit}
            onClick={() =>
              changePassword
                .mutateAsync({
                  currentPassword,
                  newPassword,
                  verificationCode: normalizeVerificationCode(verificationCode),
                })
                .then(() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setVerificationCode("");
                })
            }
          >
            {t("actions.updatePassword")}
          </Button>
        </Flex>
        </Section>
      </Flex>
    </Flex>
  );
}

function ProfilesSection() {
  const { t } = useTranslation("pages.User.Profile.Identities");
  const currentProfileId = useAuthStore((s) => s.currentProfileId);
  const currentProfileKind = useAuthStore((s) => s.currentProfileKind);
  const communityProfiles = useListProfiles(ProfileKindEnum.COMMUNITY);
  const authorityProfiles = useListProfiles(ProfileKindEnum.AUTHORITY);
  const createProfile = useCreateForgerProfile();
  const deleteProfile = useDeleteProfile();
  const selectProfile = useSelectProfile({
    switchingMsg: t("profileSwitching"),
    onCommit: () => {
      routerEventEmitter.navigate({ to: ROUTES.CERTS_OVERVIEW, replace: true });
    },
  });
  const [displayName, setDisplayName] = useState("");
  const [profileLanguage, setProfileLanguage] = useState<LanguageEnum>(LanguageEnum.EN);
  const [switchingId, setSwitchingId] = useState<Nullable<string>>(null);

  const community = safeArray(communityProfiles.data?.items);
  const authority = safeArray(authorityProfiles.data?.items);
  const rows: IdentityRow[] = [...community.map(toCommunityRow), ...authority.map(toAuthorityRow)];
  const total = rows.length;
  const atFloor = total <= 1;

  const handleSwitch = async (profileId: string, kind: ProfileKindEnum) => {
    if ((profileId === currentProfileId && kind === currentProfileKind) || selectProfile.isPending) return;
    setSwitchingId(profileId);
    try {
      await selectProfile.mutateAsync({ profileId, kind });
    } finally {
      setSwitchingId(null);
    }
  };

  const handleDelete = (profileId: string, kind: ProfileKindEnum, name: string) => {
    showConfirm({
      title: t("actions.deleteProfile"),
      message: t("labels.deleteConfirmBody", { name }),
      confirmText: t("actions.deleteProfile"),
      cancelText: t("actions.cancelEdit"),
      onConfirm: () => deleteProfile.mutate({ profileId, kind }),
    });
  };

  return (
    <Flex direction="column" gap="3">
      <Flex direction="column" gap="3">
        <Flex direction="column" gap="3">
          <SectionHead title={t("sections.profiles.title")} description={t("sections.profiles.description")} />
          {rows.length ? (
            rows.map((row) => {
              const isCommunity = row.kind === ProfileKindEnum.COMMUNITY;
              const isCurrent = row.profileId === currentProfileId && row.kind === currentProfileKind;
              const name = safeStringable(row.displayName) || t("labels.emptyName");
              const isSwitching = switchingId === row.profileId;
              const busy = isSwitching || deleteProfile.isPending || selectProfile.isPending;
              const initials = name.slice(0, 2).toUpperCase();

              return (
                <Card size="2" variant="surface" key={`${row.kind}-${row.profileId}`} className={isCurrent ? styles.current : undefined}>
                <Flex align="center" justify="between" gap="3" wrap="wrap">
                  <Flex align="center" gap="3" minWidth="0" flexGrow="1">
                    <Avatar size="3" radius="full" src={row.avatarImageId ? buildAvatarImageSrc(row.avatarImageId) : undefined} fallback={initials} />
                    <Flex direction="column" gap="1" minWidth="0">
                      <Text size="2" weight="medium">
                        {name}
                      </Text>
                      <Flex gap="2" align="center" wrap="wrap">
                        <Badge color={isCommunity ? "blue" : "amber"} variant="surface" radius="full">
                          {isCommunity ? t("labels.scopeCommunity") : t("labels.scopeAuthority")}
                        </Badge>
                        <Text size="1" color="gray" className={styles.mono}>
                          {row.profileId}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex gap="2" wrap="wrap" align="center">
                    {isCurrent ? (
                      <Badge color="green" variant="surface" radius="full">
                        {t("labels.current")}
                      </Badge>
                    ) : (
                      <Button size="1" variant="outline" color="gray" disabled={busy} loading={isSwitching} onClick={() => void handleSwitch(row.profileId, row.kind)}>
                        {t("actions.switch")}
                      </Button>
                    )}
                    {isCommunity ? (
                      <Button size="1"
                        variant="outline"
                        color="red"
                        disabled={isCurrent || atFloor || busy}
                        title={isCurrent ? t("labels.cannotDeleteCurrent") : atFloor ? t("labels.cannotDeleteLast") : undefined}
                        loading={deleteProfile.isPending}
                        onClick={() => handleDelete(row.profileId, row.kind, name)}
                      >
                        {t("actions.deleteProfile")}
                      </Button>
                    ) : null}
                  </Flex>
                </Flex>
                </Card>
              );
            })
          ) : (
            <EmptyState icon={UsersIcon} title={t("empty.profiles.title")} description={t("empty.profiles.description")} />
          )}
        </Flex>
      </Flex>

      <Flex direction="column" gap="3">
        <Flex direction="column" gap="3">
          <SectionHead title={t("labels.newCommunityProfile")} description={t("sections.forgerProfiles.description")} />
          <Flex direction="column" gap="2">
            <Text size="1" weight="medium" color="gray">
              {t("labels.displayName")}
            </Text>
            <TextField.Root size="2" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t("labels.displayName")} />
          </Flex>
          <Flex direction="column" gap="2">
            <Text size="1" weight="medium" color="gray">
              {t("labels.profileLanguage")}
            </Text>
            <Flex align="center" justify="between" gap="3" wrap="wrap">
              <Box minWidth="0" >
                <Select.Root value={profileLanguage} onValueChange={(v) => setProfileLanguage(v as LanguageEnum)}>
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value={LanguageEnum.EN}>{t("labels.langEn")}</Select.Item>
                    <Select.Item value={LanguageEnum.ZH}>{t("labels.langZh")}</Select.Item>
                    <Select.Item value={LanguageEnum.FR}>{t("labels.langFr")}</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
              <Button size="2"
                loading={createProfile.isPending}
                disabled={!displayName.trim()}
                onClick={() => createProfile.mutate({ displayName: displayName.trim(), profileLanguage }, { onSuccess: () => setDisplayName("") })}
              >
                {t("actions.createProfile")}
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

function IdentitiesBody() {
  const { t } = useTranslation("pages.User.Profile.Identities");
  const [section, setSection] = useState<SectionId>("profiles");
  const sections: { id: SectionId; label: string }[] = [
    { id: "profiles", label: t("sections.profiles.title") },
    { id: "emails", label: t("sections.emails.title") },
    { id: "phones", label: t("sections.phones.title") },
    { id: "password", label: t("sections.password.title") },
  ];

  return (
    <Grid columns={{ initial: "1", md: "14rem minmax(0, 1fr)" }} gap="5" align="start">
      <Card size="2" variant="classic" className={styles.nav}>
        <Section size="1" py="3">
          <Container size="1" px="3" width="100%" maxWidth="100%">
            <LayoutGroup id="identities-nav">
              <Flex direction={{ initial: "row", md: "column" }} gap="1" wrap="wrap">
                {sections.map((s) => {
                  const active = section === s.id;
                  return (
                    <Box key={s.id} position="relative">
                      {active ? <motion.span layoutId="identities-active" className={styles.activePill} transition={{ type: "spring", stiffness: 520, damping: 42 }} /> : null}
                      <Button variant="ghost" color={active ? undefined : "gray"} highContrast={!active} className={styles.navItem} data-active={active ? "true" : undefined} onClick={() => setSection(s.id)}>
                        {s.label}
                      </Button>
                    </Box>
                  );
                })}
              </Flex>
            </LayoutGroup>
          </Container>
        </Section>
      </Card>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
          <Card size="3" variant="surface">
            {section === "profiles" ? <ProfilesSection /> : null}
            {section === "emails" ? <EmailsSection /> : null}
            {section === "phones" ? <PhonesSection /> : null}
            {section === "password" ? <PasswordSection /> : null}
          </Card>
        </motion.div>
      </AnimatePresence>
    </Grid>
  );
}

export default function ProfileIdentitiesPage() {
  const { t } = useTranslation("pages.User.Profile.Identities");
  return (
    <PageFrame>
      <PageHeader icon={UsersIcon} index={t("index")} title={t("title")} description={t("description")} />
      <ActionBar>
        <Button size="2" variant="outline" color="gray" onClick={() => routerEventEmitter.navigate({ to: ROUTES.USER_PROFILE_OVERVIEW })}>
          <ArrowNarrowLeftIcon size={16} />
          {t("actions.openProfile")}
        </Button>
      </ActionBar>
      <Suspense loadingText={t("labels.loading")}>
        <IdentitiesBody />
      </Suspense>
    </PageFrame>
  );
}

import { ArrowNarrowLeftIcon, PenIcon, UploadIcon } from "nfx-ui/icons";
import type { ReactNode } from "react";

import { useRef, useState } from "react";
import { Avatar, Button, Dialog, Flex, Grid, Section, Select, Text, TextArea, TextField } from "@radix-ui/themes";
import { LanguageEnum } from "nfx-ui/enums";
import { systemEventEmitter } from "nfx-ui/events";
import { useConfirmImageUpload, useConfirmProfileAvatar, useCurrentProfile, useDeleteImage, usePatchProfile, usePrepareImageUpload } from "nfx-ui/hooks";
import { useInitUserProfileEditForm, type UserProfileEditFormData } from "nfx-ui/schemas";
import type { Profile } from "nfx-ui/types";
import { Controller, type Control, type FieldPath } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ActionBar, EmptyState, FormSection, PageHeader } from "@/components";
import { routerEventEmitter } from "@/events/router";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";
import { buildImageUrl, buildProfilePatch, compressImage, getApiErrorMessage, getCommandMessage, isEmptyPatch, resolveAccountInitial, safeNullable } from "@/utils";

import BackgroundGallery from "./backgrounds/BackgroundGallery";
import styles from "./s.module.css";

function AvatarSection() {
  const { t } = useTranslation("pages.User.Profile.Edit");
  const { profile, data } = useCurrentProfile();
  const prepareUpload = usePrepareImageUpload();
  const confirmUpload = useConfirmImageUpload();
  const confirmAvatar = useConfirmProfileAvatar();
  const deleteImage = useDeleteImage({ ifShowError: false });
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<Nullable<string>>(null);
  const [pendingImageId, setPendingImageId] = useState<Nullable<string>>(null);

  const accountId = safeNullable(data?.account.id);
  const initial = resolveAccountInitial(profile?.displayName, accountId);
  const currentAvatarId = safeNullable(profile?.avatars?.[0]?.imageId);
  const busy = prepareUpload.isPending || confirmUpload.isPending;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      systemEventEmitter.showError(t("avatar.invalidType"));
      return;
    }
    if (pendingImageId) deleteImage.mutate(pendingImageId);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingImageId(null);
    try {
      const compressed = await compressImage(file);
      const prep = await prepareUpload.mutateAsync({
        fileName: compressed.name,
        mimeType: compressed.type || "image/png",
      });
      const putRes = await fetch(prep.uploadUrl, {
        method: "PUT",
        body: compressed,
        headers: { "Content-Type": compressed.type || "image/png" },
      });
      if (!putRes.ok) throw new Error(`upload ${putRes.status}`);
      setPendingImageId(prep.id);
    } catch (err) {
      systemEventEmitter.showError(getApiErrorMessage(err, t("avatar.uploadFailed")));
      setPendingImageId(null);
    }
  };

  const handleConfirm = async () => {
    if (!pendingImageId) {
      systemEventEmitter.showError(t("avatar.noImage"));
      return;
    }
    try {
      await confirmUpload.mutateAsync({ id: pendingImageId });
      await confirmAvatar.mutateAsync({ imageId: pendingImageId });
      systemEventEmitter.showSuccess(getCommandMessage("USER_PROFILE_AVATAR_UPDATED", t("avatar.success")));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingImageId(null);
    } catch (err) {
      systemEventEmitter.showError(getApiErrorMessage(err, t("avatar.confirmFailed")));
    }
  };

  const src = previewUrl || (currentAvatarId ? buildImageUrl(currentAvatarId) : undefined);

  return (
    <FormSection
      step={1}
      title={t("avatar.title")}
      hint={t("avatar.hint")}
      footer={
        <>
          <Button size="2" variant="outline" color="gray" loading={busy} onClick={() => fileRef.current?.click()}>
            <UploadIcon size={14} />
            {t("avatar.choose")}
          </Button>
          <Button size="2" disabled={!pendingImageId || busy} loading={confirmUpload.isPending} onClick={() => void handleConfirm()}>
            {t("avatar.confirm")}
          </Button>
        </>
      }
    >
          <Flex align="center" gap="4" minWidth="0">
            <Avatar size="6" radius="full" src={src} fallback={initial} className={styles.portrait} data-pending={pendingImageId ? "true" : undefined} />
            <Text size="2" color="gray">
              {t("avatar.pickHint")}
            </Text>
          </Flex>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.hiddenFile}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
    </FormSection>
  );
}

const GENDERS = ["female", "male", "nonbinary"] as const;
const TIMEZONES = ["UTC", "America/Vancouver", "America/Los_Angeles", "America/New_York", "Europe/London", "Europe/Paris", "Asia/Shanghai", "Asia/Tokyo"] as const;

function genderLabel(t: (key: string) => string, value: string) {
  if (value === "female") return t("labels.genderFemale");
  if (value === "male") return t("labels.genderMale");
  if (value === "nonbinary") return t("labels.genderNonbinary");
  return value;
}

function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <Flex direction="column" gap="1" minWidth="0">
      <Text size="1" weight="medium" color="gray">
        {label}
      </Text>
      {children}
      {error ? (
        <Text size="1" color="red">
          {error}
        </Text>
      ) : null}
    </Flex>
  );
}

function TextControl({ name, control }: { name: FieldPath<UserProfileEditFormData>; control: Control<UserProfileEditFormData> }) {
  return <Controller name={name} control={control} render={({ field }) => <TextField.Root size="2" value={String(field.value ?? "")} onChange={field.onChange} />} />;
}

function BirthdayField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useTranslation("pages.User.Profile.Edit");
  const [open, setOpen] = useState(false);
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const today = new Date();
  const [year, setYear] = useState(parsed?.[1] ?? String(today.getFullYear() - 25));
  const [month, setMonth] = useState(parsed?.[2] ?? "01");
  const [day, setDay] = useState(parsed?.[3] ?? "01");
  const years = Array.from({ length: today.getFullYear() - 1899 }, (_, index) => String(today.getFullYear() - index));

  return (
    <>
      <TextField.Root size="2" readOnly value={parsed ? value : ""} placeholder={t("datePicker.placeholder")} onClick={() => setOpen(true)} />
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content maxWidth="24rem">
          <Section size="1" py="2">
            <Flex direction="column" gap="4">
              <Dialog.Title>{t("datePicker.title")}</Dialog.Title>
              <Grid columns="3" gap="3">
                <Field label={t("datePicker.year")}>
                  <Select.Root value={year} onValueChange={setYear}>
                    <Select.Trigger />
                    <Select.Content>
                      {years.map((item) => (
                        <Select.Item key={item} value={item}>
                          {item}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Field>
                <Field label={t("datePicker.month")}>
                  <Select.Root value={month} onValueChange={setMonth}>
                    <Select.Trigger />
                    <Select.Content>
                      {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")).map((item) => (
                        <Select.Item key={item} value={item}>
                          {item}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Field>
                <Field label={t("datePicker.day")}>
                  <Select.Root value={day} onValueChange={setDay}>
                    <Select.Trigger />
                    <Select.Content>
                      {Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0")).map((item) => (
                        <Select.Item key={item} value={item}>
                          {item}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Field>
              </Grid>
              <Flex justify="end" gap="2">
                <Button variant="outline" color="gray" onClick={() => { onChange(""); setOpen(false); }}>
                  {t("datePicker.clear")}
                </Button>
                <Button variant="outline" color="gray" onClick={() => setOpen(false)}>
                  {t("datePicker.cancel")}
                </Button>
                <Button
                  onClick={() => {
                    const candidate = new Date(Number(year), Number(month) - 1, Number(day));
                    if (candidate.getFullYear() !== Number(year) || candidate.getMonth() !== Number(month) - 1 || candidate.getDate() !== Number(day)) return;
                    onChange(`${year}-${month}-${day}`);
                    setOpen(false);
                  }}
                >
                  {t("datePicker.confirm")}
                </Button>
              </Flex>
            </Flex>
          </Section>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

function ProfileForm({ profile }: { profile: Profile.Response.ProfileBase }) {
  const { t } = useTranslation("pages.User.Profile.Edit");
  const form = useInitUserProfileEditForm(t, profile);
  const patch = usePatchProfile({ successMsg: t("saveSuccess") });
  const genderValue = form.watch("gender");
  const timezoneValue = form.watch("timezone");
  const genderOptions = genderValue && !GENDERS.includes(genderValue as (typeof GENDERS)[number]) ? [genderValue, ...GENDERS] : [...GENDERS];
  const timezoneOptions = timezoneValue && !TIMEZONES.includes(timezoneValue as (typeof TIMEZONES)[number]) ? [timezoneValue, ...TIMEZONES] : [...TIMEZONES];

  return (
    <>
      <FormSection step={3} title={t("sections.identity.title")} hint={t("sections.identity.description")}>
            <Grid columns={{ initial: "1", sm: "2" }} gap="4">
              <Field label={t("labels.displayName")}><TextControl name="displayName" control={form.control} /></Field>
              <Field label={t("labels.profileLanguage")}>
                <Controller
                  name="profileLanguage"
                  control={form.control}
                  render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value={LanguageEnum.EN}>{t("labels.langEn")}</Select.Item>
                        <Select.Item value={LanguageEnum.ZH}>{t("labels.langZh")}</Select.Item>
                        <Select.Item value={LanguageEnum.FR}>{t("labels.langFr")}</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
              </Field>
              <Field label={t("labels.firstName")}><TextControl name="firstName" control={form.control} /></Field>
              <Field label={t("labels.lastName")}><TextControl name="lastName" control={form.control} /></Field>
            </Grid>
      </FormSection>
      <FormSection step={4} title={t("sections.place.title")} hint={t("sections.place.description")}>
            <Grid columns={{ initial: "1", sm: "2" }} gap="4">
              <Field label={t("labels.city")}><TextControl name="city" control={form.control} /></Field>
              <Field label={t("labels.country")}><TextControl name="country" control={form.control} /></Field>
              <Field label={t("labels.timezone")}>
                <Controller
                  name="timezone"
                  control={form.control}
                  render={({ field }) => (
                    <Select.Root value={field.value || "UTC"} onValueChange={field.onChange}>
                      <Select.Trigger />
                      <Select.Content>
                        {timezoneOptions.map((zone) => (
                          <Select.Item key={zone} value={zone}>{zone}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
              </Field>
              <Field label={t("labels.website")} error={form.formState.errors.website?.message}>
                <TextControl name="website" control={form.control} />
              </Field>
            </Grid>
      </FormSection>
      <FormSection
        step={5}
        title={t("sections.personal.title")}
        hint={t("sections.personal.description")}
        footer={
          <Button
            size="2"
            loading={patch.isPending}
            onClick={form.handleSubmit((values) => {
              const body = buildProfilePatch(profile, values);
              if (isEmptyPatch(body)) return;
              patch.mutate(body);
            })}
          >
            {t("actions.saveChanges")}
          </Button>
        }
      >
            <Grid columns={{ initial: "1", sm: "2" }} gap="4">
              <Field label={t("labels.gender")}>
                <Controller
                  name="gender"
                  control={form.control}
                  render={({ field }) => (
                    <Select.Root value={field.value || "unspecified"} onValueChange={(value) => field.onChange(value === "unspecified" ? "" : value)}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="unspecified">{t("labels.genderUnspecified")}</Select.Item>
                        {genderOptions.map((value) => (
                          <Select.Item key={value} value={value}>{genderLabel(t, value)}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
              </Field>
              <Field label={t("labels.birthday")}>
                <Controller name="birthday" control={form.control} render={({ field }) => <BirthdayField value={field.value} onChange={field.onChange} />} />
              </Field>
            </Grid>
            <Field label={t("labels.bio")}>
              <Controller name="bio" control={form.control} render={({ field }) => <TextArea size="2" rows={5} value={field.value} onChange={field.onChange} />} />
            </Field>
      </FormSection>
    </>
  );
}

export default function ProfileEditPage() {
  const { t } = useTranslation("pages.User.Profile.Edit");
  const { profile } = useCurrentProfile();

  return (
    <PageFrame>
      <PageHeader icon={PenIcon} index={t("index")} title={t("title")} description={t("description")} />
      <ActionBar>
        <Button size="2" variant="outline" color="gray" onClick={() => routerEventEmitter.navigate({ to: ROUTES.USER_PROFILE_OVERVIEW })}>
          <ArrowNarrowLeftIcon size={16} />
          {t("actions.openProfile")}
        </Button>
      </ActionBar>
      <AvatarSection />
      {profile ? <BackgroundGallery profile={profile} /> : null}
      {profile ? <ProfileForm profile={profile} /> : (
        <EmptyState
          icon={PenIcon}
          title={t("empty.title")}
          description={t("empty.description")}
          action={
            <Button size="2" onClick={() => routerEventEmitter.navigate({ to: ROUTES.USER_PROFILE_OVERVIEW })}>
              {t("actions.openProfile")}
            </Button>
          }
        />
      )}
    </PageFrame>
  );
}

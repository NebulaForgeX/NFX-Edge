import { PenIcon } from "nfx-ui/icons";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, Box, Button, Flex, Text, TextArea } from "@radix-ui/themes";
import { systemEventEmitter } from "nfx-ui/events";
import { useConfirmImageUpload, useConfirmProfileAvatar, useCurrentProfile, useDeleteImage, usePatchProfile, usePrepareImageUpload } from "nfx-ui/hooks";
import { useTranslation } from "react-i18next";

import { Input, LucideIcon, PageHeader } from "@/components";
import { PageFrame } from "@/layouts";
import { buildImageUrl, buildProfilePatch, compressImage, getApiErrorMessage, getCommandMessage, isEmptyPatch, resolveAccountInitial, safeNullable, safeStringable } from "@/utils";

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
    <Box className={styles.hairline}>
      <Box py="5">
        <Flex direction="column" gap="4">
          <Text className={styles.kicker}>{t("avatar.title")}</Text>
          <Text as="p" size="2" className={styles.lede}>
            {t("avatar.hint")}
          </Text>
          <Flex align="center" justify="between" gap="4" wrap="wrap">
            <Flex align="center" gap="4" minWidth="0">
              <div className={styles.portrait}>
                <Avatar size="5" radius="none" src={src} fallback={initial} />
              </div>
              <Text size="2" color="gray">
                {t("avatar.pickHint")}
              </Text>
            </Flex>
            <Flex gap="2" wrap="wrap" align="center">
              <Button size="2" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
                <LucideIcon icon={Upload} size={14} />
                {busy ? t("avatar.uploading") : t("avatar.choose")}
              </Button>
              <Button size="2" disabled={!pendingImageId || busy} onClick={() => void handleConfirm()}>
                {confirmUpload.isPending ? t("avatar.confirming") : t("avatar.confirm")}
              </Button>
            </Flex>
          </Flex>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.hidden}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
        </Flex>
      </Box>
    </Box>
  );
}

export default function ProfileEditPage() {
  const { t } = useTranslation("pages.User.Profile.Edit");
  const { profile } = useCurrentProfile();
  const patch = usePatchProfile();
  const [displayName, setDisplayName] = useState(safeStringable(profile?.displayName));
  const [bio, setBio] = useState(safeStringable(profile?.bio));
  const [city, setCity] = useState(safeStringable(profile?.city));
  const [website, setWebsite] = useState(safeStringable(profile?.website));

  return (
    <PageFrame>
      <PageHeader icon={PenIcon} index={t("index")} title={t("title")} description={t("description")} />
      <AvatarSection />
      {profile ? (
        <Box className={styles.hairline}>
          <Box py="5">
            <BackgroundGallery profile={profile} />
          </Box>
        </Box>
      ) : null}
      <Box className={styles.hairline}>
        <Box py="5">
          <Flex direction="column" gap="4">
            <Text className={styles.kicker}>{t("sections.basics.title")}</Text>
            <Text as="p" size="2" className={styles.lede}>
              {t("sections.basics.description")}
            </Text>
            <div className={styles.fields}>
              <Input label={t("labels.displayName")} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <Input label={t("labels.city")} value={city} onChange={(e) => setCity(e.target.value)} />
              <Flex direction="column" gap="1" className={styles.span2}>
                <Text as="span" className={styles.kicker} style={{ letterSpacing: "0.14em", color: "var(--gray-10)" }}>
                  {t("labels.bio")}
                </Text>
                <TextArea size="2" variant="classic" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
              </Flex>
              <Input className={styles.span2} label={t("labels.website")} value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <Flex justify="end">
              <Button
                size="2"
                loading={patch.isPending}
                disabled={!profile}
                onClick={() => {
                  if (!profile) return;
                  const body = buildProfilePatch(profile, {
                    displayName,
                    bio,
                    city,
                    website,
                  });
                  if (isEmptyPatch(body)) return;
                  patch.mutate(body);
                }}
              >
                {t("actions.saveChanges")}
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </PageFrame>
  );
}

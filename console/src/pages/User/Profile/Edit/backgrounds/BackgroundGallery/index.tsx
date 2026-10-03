import { ArrowNarrowLeftIcon, ArrowNarrowRightIcon, CameraIcon, SaveIcon, TrashIcon } from "nfx-ui/icons";
import type { Profile } from "nfx-ui/types";

import { useRef } from "react";
import { Badge, Box, Button, Flex, Grid, IconButton, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { EmptyState, FormSection } from "@/components";

import { isUserProfileBackgroundDraftBusy } from "../drafts";
import styles from "./s.module.css";
import { useUserProfileBackgroundUpload } from "../useUserProfileBackgroundUpload";

const MAX_PROFILE_BACKGROUNDS = 6;

export default function BackgroundGallery({ profile }: { profile: Profile.Response.ProfileBase }) {
  const { t } = useTranslation("pages.User.Profile.Edit");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { drafts, uploading, confirming, dirty, imageError, uploadFiles, removeDraft, moveDraft, confirmDrafts } = useUserProfileBackgroundUpload(profile, MAX_PROFILE_BACKGROUNDS);

  const completedCount = drafts.filter((d) => !isUserProfileBackgroundDraftBusy(d) && d.status !== "failed").length;
  const atLimit = drafts.filter((d) => d.status !== "failed").length >= MAX_PROFILE_BACKGROUNDS;

  return (
    <FormSection
      step={2}
      title={t("backgroundUpload.label")}
      hint={t("backgroundUpload.hint")}
      footer={
        <>
          <Button type="button" size="2" variant="outline" color="gray" disabled={uploading || confirming || atLimit} onClick={() => fileInputRef.current?.click()}>
            <CameraIcon size={14} />
            {atLimit ? t("backgroundUpload.full") : t("backgroundUpload.add")}
          </Button>
          <Button type="button" size="2" disabled={!dirty || uploading || confirming} loading={confirming} onClick={() => void confirmDrafts()}>
            <SaveIcon size={14} />
            {t("backgroundUpload.confirm")}
          </Button>
        </>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.hiddenInput}
        onChange={(event) => {
          const files = event.target.files;
          if (files?.length) void uploadFiles(files);
          event.target.value = "";
        }}
      />

      <Text size="1" color="gray">
        {t("backgroundUpload.queueSummary", { done: completedCount, total: MAX_PROFILE_BACKGROUNDS })}
      </Text>
      {drafts.length ? (
        <Grid columns="repeat(auto-fill, minmax(10rem, 1fr))" gap="3" width="100%">
          {drafts.map((draft, index) => {
            const busy = isUserProfileBackgroundDraftBusy(draft);
            const failed = draft.status === "failed";
            return (
              <Box key={draft.imageId} className={styles.tile} data-failed={failed ? "true" : undefined}>
                <img src={draft.previewUrl} alt="" className={styles.tileImage} draggable={false} />
                <Box position="absolute" top="2" left="2">
                  <Badge size="1" variant="solid" color="gray" highContrast radius="full">
                    {draft.sortOrder + 1}
                  </Badge>
                </Box>
                {busy ? (
                  <Flex align="center" justify="center" className={styles.busyOverlay}>
                    <Badge size="2" variant="solid" color="gray" highContrast radius="full">
                      {Math.round(draft.progress ?? 0)}%
                    </Badge>
                  </Flex>
                ) : null}
                {failed ? (
                  <Flex align="center" justify="center" className={styles.failedOverlay}>
                    <Badge color="red" variant="solid">
                      {t("backgroundUpload.status.failed")}
                    </Badge>
                  </Flex>
                ) : null}
                <Box position="absolute" right="2" bottom="2" className={styles.tileActions}>
                  <Flex gap="1">
                    <IconButton
                      type="button"
                      size="1"
                      variant="classic"
                      color="gray"
                      disabled={busy || failed || index === 0}
                      onClick={() => moveDraft(draft.imageId, -1)}
                      aria-label={t("backgroundUpload.moveLeft")}
                    >
                      <ArrowNarrowLeftIcon size={12} />
                    </IconButton>
                    <IconButton
                      type="button"
                      size="1"
                      variant="classic"
                      color="gray"
                      disabled={busy || failed || index === drafts.length - 1}
                      onClick={() => moveDraft(draft.imageId, 1)}
                      aria-label={t("backgroundUpload.moveRight")}
                    >
                      <ArrowNarrowRightIcon size={12} />
                    </IconButton>
                    <IconButton type="button" size="1" variant="classic" color="red" disabled={busy} onClick={() => removeDraft(draft.imageId)} aria-label={t("backgroundUpload.remove")}>
                      <TrashIcon size={12} />
                    </IconButton>
                  </Flex>
                </Box>
              </Box>
            );
          })}
        </Grid>
      ) : (
        <EmptyState icon={CameraIcon} title={t("backgroundUpload.dropTitle")} />
      )}

      {drafts.length > 1 ? (
        <Text size="1" color="gray">
          {t("backgroundUpload.reorderHint")}
        </Text>
      ) : null}
      {imageError ? (
        <Text size="1" color="red">
          {imageError}
        </Text>
      ) : null}
    </FormSection>
  );
}

import { UserIcon } from "nfx-ui/icons";
import { Avatar, Box, Button, Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import { useCurrentProfile } from "nfx-ui/hooks";
import { useTranslation } from "react-i18next";

import { ActionBar, EmptyState, PageHeader } from "@/components";
import { routerEventEmitter } from "@/events/router";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";
import { buildImageUrl, resolveAccountDisplayName, resolveAccountInitial, safeArray, safeNullable, safeStringable } from "@/utils";

import styles from "./s.module.css";

function Info({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation("pages.User.Profile.Overview");
  return (
    <Flex direction="column" gap="1" minWidth="0">
      <Text size="1" color="gray" weight="medium">
        {label}
      </Text>
      <Text size="2">{value || t("labels.notSpecified")}</Text>
    </Flex>
  );
}

export default function ProfileOverviewPage() {
  const { t } = useTranslation("pages.User.Profile.Overview");
  const { data, profile, kind } = useCurrentProfile();
  const accountId = safeNullable(data?.account.id);
  const name = resolveAccountDisplayName(profile?.displayName, accountId);
  const initial = resolveAccountInitial(profile?.displayName, accountId);
  const avatarImageId = safeNullable(profile?.avatars?.[0]?.imageId);
  const backgrounds = safeArray(profile?.backgrounds)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.imageId.localeCompare(b.imageId));
  const coverId = backgrounds[0]?.imageId;

  return (
    <PageFrame>
      <PageHeader icon={UserIcon} index={t("index")} title={t("title")} description={t("description")} />
      <ActionBar>
        <Button size="2" onClick={() => routerEventEmitter.navigate({ to: ROUTES.USER_PROFILE_EDIT })}>
          {t("actions.edit")}
        </Button>
      </ActionBar>

      <Flex direction="column" gap="6">
        <Box className={styles.identity}>
          {coverId ? (
            <Box className={styles.cover}>
              <img src={buildImageUrl(coverId)} alt="" className={styles.coverImage} />
            </Box>
          ) : null}
          <Container width="100%" maxWidth="100%" px="5">
            <Section py="4">
              <Flex align="center" gap="3">
                <Avatar size="4" radius="full" src={avatarImageId ? buildImageUrl(avatarImageId) : undefined} fallback={initial} />
                <Flex direction="column" gap="1" minWidth="0">
                  <Text size="4" weight="bold">
                    {name}
                  </Text>
                  <Text size="1" color="gray">
                    {kind}
                  </Text>
                </Flex>
              </Flex>
            </Section>
          </Container>
          <Container width="100%" maxWidth="100%" px="5">
            <Section pt="0" pb="5">
              <Grid columns={{ initial: "1", sm: "3" }} gap="4">
                <Info label={t("labels.bio")} value={safeStringable(profile?.bio)} />
                <Info label={t("labels.city")} value={safeStringable(profile?.city)} />
                <Info label={t("labels.country")} value={safeStringable(profile?.country)} />
                <Info label={t("labels.website")} value={safeStringable(profile?.website)} />
                <Info label={t("labels.timezone")} value={safeStringable(profile?.timezone)} />
                <Info label={t("labels.emails")} value={String(data?.emails?.length ?? 0)} />
              </Grid>
            </Section>
          </Container>
        </Box>

        <Flex direction="column" gap="3">
          <Text size="2" weight="bold">
            {t("labels.backgroundGallery")}
          </Text>
          {backgrounds.length ? (
            <Grid columns="repeat(auto-fill, minmax(160px, 1fr))" gap="3">
              {backgrounds.map((bg) => (
                <Box key={bg.imageId} className={styles.galleryItem}>
                  <img src={buildImageUrl(bg.imageId)} alt="" className={styles.galleryImage} loading="lazy" draggable={false} />
                </Box>
              ))}
            </Grid>
          ) : (
            <EmptyState icon={UserIcon} title={t("labels.noBackgrounds")} />
          )}
        </Flex>
      </Flex>
    </PageFrame>
  );
}

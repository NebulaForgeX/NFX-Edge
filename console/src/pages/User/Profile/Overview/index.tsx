import { PenIcon, UserIcon } from "nfx-ui/icons";
import { Avatar, Badge, Box, Button, Card, DataList, Flex, Grid, Heading, Inset, Section, Text } from "@radix-ui/themes";
import { useCurrentProfile } from "nfx-ui/hooks";
import { useTranslation } from "react-i18next";

import { EmptyState, PageHeader } from "@/components";
import { routerEventEmitter } from "@/events/router";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";
import { buildImageUrl, resolveAccountDisplayName, resolveAccountInitial, safeArray, safeNullable, safeStringable } from "@/utils";

import styles from "./s.module.css";

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
  const goEdit = () => routerEventEmitter.navigate({ to: ROUTES.USER_PROFILE_EDIT });
  const fields = [
    { key: "bio", label: t("labels.bio"), value: safeStringable(profile?.bio) },
    { key: "city", label: t("labels.city"), value: safeStringable(profile?.city) },
    { key: "country", label: t("labels.country"), value: safeStringable(profile?.country) },
    { key: "website", label: t("labels.website"), value: safeStringable(profile?.website) },
    { key: "timezone", label: t("labels.timezone"), value: safeStringable(profile?.timezone) },
    { key: "emails", label: t("labels.emails"), value: String(data?.emails?.length ?? 0) },
  ];

  return (
    <PageFrame>
      <PageHeader
        icon={UserIcon}
        index={t("index")}
        title={t("title")}
        description={t("description")}
        actions={
          <Button size="2" onClick={goEdit}>
            <PenIcon size={16} />
            {t("actions.edit")}
          </Button>
        }
      />

      <Card size="3" variant="surface">
        <Inset side="top" clip="padding-box">
          <Box className={styles.cover}>{coverId ? <img src={buildImageUrl(coverId)} alt="" className={styles.coverImage} /> : null}</Box>
        </Inset>
        <Flex direction="column" gap="5">
          <Section size="1" py="0" mt="-8">
            <Flex align="end" gap="4">
              <Avatar size="7" radius="full" src={avatarImageId ? buildImageUrl(avatarImageId) : undefined} fallback={initial} className={styles.avatar} />
              <Flex direction="column" gap="1" minWidth="0">
                <Heading as="h2" size="6" weight="bold" truncate>
                  {name}
                </Heading>
                <Flex>
                  <Badge variant="surface" radius="full">
                    {kind}
                  </Badge>
                </Flex>
              </Flex>
            </Flex>
          </Section>
          <DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }} size="2">
            {fields.map((field) => (
              <DataList.Item key={field.key}>
                <DataList.Label minWidth="9rem">{field.label}</DataList.Label>
                <DataList.Value>
                  {field.value ? (
                    field.value
                  ) : (
                    <Text color="gray">{t("labels.notSpecified")}</Text>
                  )}
                </DataList.Value>
              </DataList.Item>
            ))}
          </DataList.Root>
        </Flex>
      </Card>

      <Flex direction="column" gap="3">
        <Heading as="h3" size="3" weight="bold">
          {t("labels.backgroundGallery")}
        </Heading>
        {backgrounds.length ? (
          <Grid columns="repeat(auto-fill, minmax(10rem, 1fr))" gap="3">
            {backgrounds.map((bg) => (
              <Box key={bg.imageId} className={styles.galleryItem}>
                <img src={buildImageUrl(bg.imageId)} alt="" className={styles.galleryImage} loading="lazy" draggable={false} />
              </Box>
            ))}
          </Grid>
        ) : (
          <EmptyState
            icon={UserIcon}
            title={t("labels.noBackgrounds")}
            action={
              <Button size="2" onClick={goEdit}>
                {t("actions.edit")}
              </Button>
            }
          />
        )}
      </Flex>
    </PageFrame>
  );
}

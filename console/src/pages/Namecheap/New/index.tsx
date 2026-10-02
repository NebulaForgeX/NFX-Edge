import { RouterIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { ActionBar, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useCreateNamecheapCredential } from "@/hooks/dns";
import { ROUTES } from "@/navigations";
import { showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

import CredentialForm from "../CredentialForm";

import styles from "./s.module.css";

const NamecheapNewPage = memo(() => {
  const { t } = useTranslation("dns");
  const navigate = useNavigate();
  const create = useCreateNamecheapCredential();

  return (
    <PageFrame>
      <PageHeader icon={RouterIcon} index={t("index")} title={t("accounts.add")} description={t("credential.pageHint")} />
      <ActionBar>
        <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_OVERVIEW)}>
          {t("accounts.back")}
        </Button>
      </ActionBar>
      <Grid columns={{ initial: "1", lg: "minmax(0, 1fr) 18rem" }} gap="6" align="start">
        <CredentialForm
          pending={create.isPending}
          submitLabel={t("credential.save")}
          onSubmit={async (values) => {
            const row = await create.mutateAsync(values);
            if (row?.id) {
              showSuccess(getCommandMessage("NAMECHEAP_CREDENTIAL_SAVED", t("credential.saved")));
              navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", row.id));
            }
          }}
        />
        <Section size="1" py="4" className={styles.side}>
          <Container size="2" px="4" width="100%">
            <Text size="2">{t("credential.pageHint")}</Text>
          </Container>
        </Section>
      </Grid>
    </PageFrame>
  );
});

NamecheapNewPage.displayName = "NamecheapNewPage";

export default NamecheapNewPage;

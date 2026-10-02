import { RouterIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { EmptyState, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { useNamecheapCredential, useUpdateNamecheapCredential } from "@/hooks/dns";
import { ROUTES } from "@/navigations";
import { showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

import CredentialForm from "../../CredentialForm";

import styles from "./s.module.css";

const NamecheapEditPage = memo(() => {
  const { t } = useTranslation("dns");
  const { credentialId = "" } = useParams();
  const navigate = useNavigate();
  const credentialQuery = useNamecheapCredential(credentialId);
  const update = useUpdateNamecheapCredential();
  const credential = credentialQuery.data;

  if (credentialQuery.isLoading) {
    return (
      <PageFrame>
        <EmptyState icon={RouterIcon} title={t("loading")} />
      </PageFrame>
    );
  }
  if (!credential) {
    return (
      <PageFrame>
        <EmptyState icon={RouterIcon} title={t("accounts.missing")} />
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <PageHeader icon={RouterIcon} index={t("index")} title={t("credential.edit")} description={t("credential.pageHint")} />
      <Grid columns={{ initial: "1", lg: "minmax(0, 1fr) 18rem" }} gap="6" align="start">
        <CredentialForm
          initial={{
            label: credential.label,
            apiUser: credential.apiUser,
            clientIp: credential.clientIp,
            sandbox: credential.sandbox,
          }}
          keepKeyHint={credential.hasApiKey}
          pending={update.isPending}
          submitLabel={t("credential.save")}
          onSubmit={async (values) => {
            const row = await update.mutateAsync({ id: credentialId, request: values });
            if (row) {
              showSuccess(getCommandMessage("NAMECHEAP_CREDENTIAL_SAVED", t("credential.saved")));
              navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", credentialId));
            }
          }}
        />
        <Section size="1" py="4" className={styles.side}>
          <Container size="2" px="4" width="100%">
            <Flex direction="column" gap="2">
              <Text size="1" color="gray">
                {credential.apiUser}
              </Text>
              <Text size="2">{t("credential.pageHint")}</Text>
            </Flex>
          </Container>
        </Section>
      </Grid>
    </PageFrame>
  );
});

NamecheapEditPage.displayName = "NamecheapEditPage";

export default NamecheapEditPage;

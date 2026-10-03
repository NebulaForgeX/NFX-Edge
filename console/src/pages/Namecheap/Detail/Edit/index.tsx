import { ArrowNarrowLeftIcon, PenIcon, RouterIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Grid, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { ActionBar, EmptyState, PageHeader, SideCard } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { useNamecheapCredential, useUpdateNamecheapCredential } from "@/hooks/dns";
import { ROUTES } from "@/navigations";
import { showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

import CredentialForm from "../../CredentialForm";


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
        <EmptyState
          icon={RouterIcon}
          title={t("accounts.missing")}
          action={
            <Button variant="outline" color="gray" onClick={() => navigate(ROUTES.NAMECHEAP_OVERVIEW)}>
              {t("accounts.back")}
            </Button>
          }
        />
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <PageHeader icon={RouterIcon} index={t("index")} title={t("credential.edit")} description={t("credential.pageHint")} />
      <ActionBar>
        <Button variant="outline" color="gray" onClick={() => navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", credentialId))}>
          <ArrowNarrowLeftIcon size={16} />
          {t("accounts.back")}
        </Button>
      </ActionBar>
      <Grid columns={{ initial: "1", lg: "minmax(0, 1fr) 18rem" }} gap="5" align="start">
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
        <SideCard icon={PenIcon} title={credential.label || credential.apiUser} caption={credential.apiUser}>
          <Text size="2" color="gray">
            {t("credential.pageHint")}
          </Text>
        </SideCard>
      </Grid>
    </PageFrame>
  );
});

NamecheapEditPage.displayName = "NamecheapEditPage";

export default NamecheapEditPage;

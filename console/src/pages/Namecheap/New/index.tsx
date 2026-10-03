import { ArrowNarrowLeftIcon, RouterIcon, UserPlusIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Grid, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { ActionBar, PageHeader, SideCard } from "@/components";
import { useCreateNamecheapCredential } from "@/hooks/dns";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";
import { showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";

import CredentialForm from "../CredentialForm";

const NamecheapNewPage = memo(() => {
  const { t } = useTranslation("dns");
  const navigate = useNavigate();
  const create = useCreateNamecheapCredential();

  return (
    <PageFrame>
      <PageHeader icon={RouterIcon} index={t("index")} title={t("accounts.add")} description={t("credential.pageHint")} />
      <ActionBar>
        <Button variant="outline" color="gray" onClick={() => navigate(ROUTES.NAMECHEAP_OVERVIEW)}>
          <ArrowNarrowLeftIcon size={16} />
          {t("accounts.back")}
        </Button>
      </ActionBar>
      <Grid columns={{ initial: "1", lg: "minmax(0, 1fr) 18rem" }} gap="5" align="start">
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
        <SideCard icon={UserPlusIcon} title={t("credential.title")}>
          <Text size="2" color="gray">
            {t("credential.pageHint")}
          </Text>
        </SideCard>
      </Grid>
    </PageFrame>
  );
});

NamecheapNewPage.displayName = "NamecheapNewPage";

export default NamecheapNewPage;

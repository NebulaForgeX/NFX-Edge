import { RouterIcon } from "nfx-ui/icons";
import { memo } from "react";
import { PageFrame } from "@/layouts";
import { PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useCreateNamecheapCredential } from "@/hooks/dns";
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
    </PageFrame>
  );
});

NamecheapNewPage.displayName = "NamecheapNewPage";

export default NamecheapNewPage;

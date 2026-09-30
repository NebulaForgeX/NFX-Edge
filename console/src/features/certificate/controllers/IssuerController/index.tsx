import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Flex, Text } from "@radix-ui/themes";

import { Dropdown } from "@/components";
import { CERTIFICATE_ISSUER_VALUES, DEFAULT_CERTIFICATE_ISSUER } from "@/enums";

type IssuerControllerProps = {
  /** Import / edit: show the cert's issuer CN. Apply: ACME dropdown (Let's Encrypt only). */
  record?: boolean;
};

const IssuerController = memo(({ record = false }: IssuerControllerProps) => {
  const { t } = useTranslation("certificateElements");
  const { watch, setValue, formState: { errors } } = useFormContext<CertificateFormSharedValues>();
  const issuer = watch("issuer");
  const current = (issuer ?? "").trim();

  useEffect(() => {
    if (record) return;
    if (current === DEFAULT_CERTIFICATE_ISSUER) return;
    setValue("issuer", DEFAULT_CERTIFICATE_ISSUER, { shouldValidate: true, shouldDirty: false });
  }, [record, current, setValue]);

  const options = useMemo(
    () => CERTIFICATE_ISSUER_VALUES.map((value) => ({ value, label: value })),
    [],
  );

  return (
    <Flex direction="column" gap="1">
      <Text size="1" color="gray">
        {t("form.issuer")}
      </Text>
      {record ? (
        <Text size="2">{current || "—"}</Text>
      ) : (
        <Dropdown
          options={options}
          value={DEFAULT_CERTIFICATE_ISSUER}
          onChange={(value) => setValue("issuer", value, { shouldValidate: true, shouldDirty: true })}
          error={Boolean(errors.issuer?.message)}
        />
      )}
    </Flex>
  );
});

IssuerController.displayName = "IssuerController";

export default IssuerController;

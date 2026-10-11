import type { LoginWithPhoneFormData } from "nfx-ui/schemas";
import type { ReactNode } from "react";

import { Flex, Text, TextField } from "@radix-ui/themes";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

export type LoginPhoneControllerProps = {
  /** Rendered at the end of the label row (e.g. a field index). */
  labelAside?: ReactNode;
};

const LoginPhoneController = ({ labelAside }: LoginPhoneControllerProps) => {
  const { t } = useTranslation("pages.Account.Login");
  const { control } = useFormContext<LoginWithPhoneFormData>();

  return (
    <Controller
      name="phone"
      control={control}
      render={({ field, fieldState }) => (
        <Flex direction="column" gap="1" width="100%">
          <Flex align="baseline" justify="between" gap="3">
            <Text as="label" size="2" weight="medium" htmlFor="login-phone">
              {t("form.phoneLabel")}
            </Text>
            {labelAside}
          </Flex>
          <TextField.Root id="login-phone" size="3" type="tel" placeholder={t("form.phonePlaceholder")} autoComplete="tel" {...field} />
          {fieldState.error?.message ? (
            <Text size="1" color="red">
              {fieldState.error.message}
            </Text>
          ) : null}
        </Flex>
      )}
    />
  );
};

LoginPhoneController.displayName = "LoginPhoneController";

export { LoginPhoneController };

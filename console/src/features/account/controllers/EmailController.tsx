import type { LoginFormData } from "nfx-ui/schemas";

import { Flex, Text, TextField } from "@radix-ui/themes";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

export type LoginEmailControllerProps = Record<string, never>;

const LoginEmailController = () => {
  const { t } = useTranslation("pages.Account.Login");
  const { control } = useFormContext<LoginFormData>();

  return (
    <Controller
      name="email"
      control={control}
      render={({ field, fieldState }) => (
        <Flex direction="column" gap="1" width="100%">
          <Text as="label" size="2" weight="medium" htmlFor="login-email">
            {t("form.emailLabel")}
          </Text>
          <TextField.Root id="login-email" size="3" type="email" placeholder={t("form.emailPlaceholder")} autoComplete="email" {...field} />
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

LoginEmailController.displayName = "LoginEmailController";

export { LoginEmailController };

import { AnimatedIcon, EyeIcon, EyeOffIcon } from "nfx-ui/icons";

import { useState } from "react";
import { Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

type LoginSecretFields = { password: string };

export type LoginPasswordControllerProps = Record<string, never>;

const LoginPasswordController = () => {
  const { t } = useTranslation("pages.Account.Login");
  const { control } = useFormContext<LoginSecretFields>();
  const [visible, setVisible] = useState(false);

  return (
    <Controller
      name="password"
      control={control}
      render={({ field, fieldState }) => (
        <Flex direction="column" gap="1" width="100%">
          <Text as="label" size="2" weight="medium" htmlFor="login-password">
            {t("form.passwordLabel")}
          </Text>
          <TextField.Root
            {...field}
            id="login-password"
            size="3"
            type={visible ? "text" : "password"}
            placeholder={t("form.passwordPlaceholder")}
            autoComplete="current-password"
          >
            <TextField.Slot side="right">
              <IconButton
                type="button"
                variant="ghost"
                size="1"
                color="gray"
                aria-label={visible ? t("form.hidePassword") : t("form.showPassword")}
                onClick={() => setVisible((v) => !v)}
              >
                <AnimatedIcon icon={visible ? EyeOffIcon : EyeIcon} size={14} />
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
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

LoginPasswordController.displayName = "LoginPasswordController";

export { LoginPasswordController };

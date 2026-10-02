import { AnimatedIcon, EyeIcon, EyeOffIcon } from "nfx-ui/icons";
import type { SignupFormData } from "nfx-ui/schemas";

import { useState } from "react";
import { Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

export type SignupPasswordControllerProps = Record<string, never>;

const SignupPasswordController = () => {
  const { t } = useTranslation("pages.Account.Signup");
  const { control } = useFormContext<SignupFormData>();
  const [visible, setVisible] = useState(false);

  return (
    <Controller
      name="password"
      control={control}
      render={({ field, fieldState }) => (
        <Flex direction="column" gap="1" width="100%">
          <Text as="label" size="2" weight="medium" htmlFor={field.name}>
            {t("passwordLabel")}
          </Text>
          <TextField.Root {...field} id={field.name} size="3" type={visible ? "text" : "password"} placeholder={t("passwordPlaceholder")} autoComplete="new-password">
            <TextField.Slot side="right">
              <IconButton type="button" variant="ghost" size="1" color="gray" aria-label={t("passwordLabel")} onClick={() => setVisible((v) => !v)}>
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

SignupPasswordController.displayName = "SignupPasswordController";

export interface SignupConfirmPasswordControllerProps {
  label?: string;
  placeholder?: string;
}

const SignupConfirmPasswordController = ({ label, placeholder }: SignupConfirmPasswordControllerProps) => {
  const { t } = useTranslation("pages.Account.Signup");
  const { control } = useFormContext<SignupFormData>();
  const [visible, setVisible] = useState(false);

  return (
    <Controller
      name="confirmPassword"
      control={control}
      render={({ field, fieldState }) => (
        <Flex direction="column" gap="1" width="100%">
          <Text as="label" size="2" weight="medium" htmlFor={field.name}>
            {label ?? t("confirmLabel")}
          </Text>
          <TextField.Root {...field} id={field.name} size="3" type={visible ? "text" : "password"} placeholder={placeholder ?? t("confirmPlaceholder")} autoComplete="new-password">
            <TextField.Slot side="right">
              <IconButton type="button" variant="ghost" size="1" color="gray" aria-label={label ?? t("confirmLabel")} onClick={() => setVisible((v) => !v)}>
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

SignupConfirmPasswordController.displayName = "SignupConfirmPasswordController";

export { SignupPasswordController, SignupConfirmPasswordController };

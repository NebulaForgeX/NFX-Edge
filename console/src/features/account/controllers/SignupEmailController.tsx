import type { SignupFormData } from "nfx-ui/schemas";
import type { ReactNode } from "react";

import { Flex, Text, TextField } from "@radix-ui/themes";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

export interface SignupEmailControllerProps {
  helperText?: ReactNode;
  trailingSlot?: ReactNode;
}

const SignupEmailController = ({ helperText, trailingSlot }: SignupEmailControllerProps) => {
  const { t } = useTranslation("pages.Account.Signup");
  const { control } = useFormContext<SignupFormData>();

  return (
    <Controller
      name="email"
      control={control}
      render={({ field, fieldState }) => (
        <Flex direction="column" gap="1" width="100%">
          <Text as="label" size="2" weight="medium" htmlFor="signup-email">
            {t("emailLabel")}
          </Text>
          {trailingSlot ? (
            <Flex align="end" gap="2" width="100%">
              <Flex flexGrow="1" minWidth="0">
                <TextField.Root id="signup-email" size="3" type="email" placeholder={t("emailPlaceholder")} autoComplete="email" {...field} />
              </Flex>
              {trailingSlot}
            </Flex>
          ) : (
            <TextField.Root id="signup-email" size="3" type="email" placeholder={t("emailPlaceholder")} autoComplete="email" {...field} />
          )}
          {fieldState.error?.message ? (
            <Text size="1" color="red">
              {fieldState.error.message}
            </Text>
          ) : null}
          {helperText && !fieldState.error?.message ? (
            <Text size="1" color="gray">
              {helperText}
            </Text>
          ) : null}
        </Flex>
      )}
    />
  );
};

SignupEmailController.displayName = "SignupEmailController";

export { SignupEmailController };

import type { SignupFormData } from "nfx-ui/schemas";
import type { ReactNode } from "react";

import { Flex, Text } from "@radix-ui/themes";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { VerificationCodeOtp } from "../components/VerificationCodeOtp";

export type SignupVerificationCodeControllerProps = {
  /** Rendered on the same row, after the slots (e.g. the send-code button). */
  action?: ReactNode;
};

const SignupVerificationCodeController = ({ action }: SignupVerificationCodeControllerProps) => {
  const { t } = useTranslation("pages.Account.Signup");
  const { control, formState } = useFormContext<SignupFormData>();
  const labelId = "signup-verification-code-label";

  return (
    <Controller
      name="verificationCode"
      control={control}
      render={({ field, fieldState }) => {
        const errorId = `${labelId}-error`;
        const error = fieldState.error?.message;
        const showError = Boolean(error && (fieldState.isTouched || formState.isSubmitted));

        return (
          <Flex direction="column" gap="1" width="100%" minWidth="0">
            <Text as="label" size="2" weight="medium" id={labelId}>
              {t("codeLabel")}
            </Text>
            <Flex align="center" gap="2" width="100%" minWidth="0">
              <Flex flexGrow="1" minWidth="0">
                <VerificationCodeOtp
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  hiddenInputRef={field.ref}
                  name="verificationCode"
                  labelId={labelId}
                  errorId={errorId}
                  showError={showError}
                />
              </Flex>
              {action}
            </Flex>

            {showError && error ? (
              <Text id={errorId} size="1" color="red">
                {error}
              </Text>
            ) : null}
          </Flex>
        );
      }}
    />
  );
};

SignupVerificationCodeController.displayName = "SignupVerificationCodeController";

export default SignupVerificationCodeController;

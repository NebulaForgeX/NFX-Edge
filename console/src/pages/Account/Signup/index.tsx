import { AnimatedIcon, ArrowNarrowRightIcon } from "nfx-ui/icons";
import { Button, Flex, Heading, Link, Text } from "@radix-ui/themes";
import { AuthSignupPlatformEnum, LanguageEnum } from "nfx-ui/enums";
import { useSendVerificationCode, useSignupWithEmail } from "nfx-ui/hooks";
import { SignupFormData, useInitSignupForm } from "nfx-ui/schemas";
import { usePreferenceStore } from "nfx-ui/stores";
import { FormProvider, SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import {
  SignupConfirmPasswordController,
  SignupEmailController,
  SignupPasswordController,
  SignupRememberController,
  SignupVerificationCodeController,
} from "@/features/account";
import { ROUTES } from "@/navigations";

import SignupShell from "./SignupShell";
import styles from "./s.module.css";

export default function SignupPage() {
  const { t } = useTranslation("pages.Account.Signup");
  const form = useInitSignupForm();
  const signup = useSignupWithEmail();
  const sendCode = useSendVerificationCode();
  const language = usePreferenceStore((s) => s.language);

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    await signup.mutateAsync({
      email: data.email,
      password: data.password,
      verificationCode: data.verificationCode,
      lang: language ?? LanguageEnum.EN,
      rememberMe: data.rememberMe ?? false,
      signupPlatform: AuthSignupPlatformEnum.NFXEDGE,
    });
    routerEventEmitter.navigate({ to: ROUTES.USER_OVERVIEW, replace: true });
  };

  const email = form.watch("email");

  return (
    <SignupShell>
      <div className={styles.sheetHead}>
        <Text as="p" size="1" weight="bold" className={styles.kicker}>
          {t("ledger.kicker")}
        </Text>
        <Heading as="h1" size="6">
          {t("ledger.title")}
        </Heading>
        <Text as="p" size="2" color="gray">
          {t("ledger.subtitle")}
        </Text>
      </div>

      <FormProvider {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <div className={styles.field}>
            <span className={styles.fieldNum}>{t("steps.verifyNum")}</span>
            <SignupEmailController helperText={t("emailHint")} />
          </div>

          <div className={styles.field}>
            <span className={styles.fieldNum}>{t("steps.verifyNum")}</span>
            <Flex direction="column" gap="2">
              <SignupVerificationCodeController />
              <Button
                type="button"
                size="3"
                variant="outline"
                loading={sendCode.isPending}
                disabled={!email}
                onClick={() =>
                  email &&
                  sendCode.mutate({
                    email,
                    lang: language ?? LanguageEnum.EN,
                  })
                }
              >
                {t("sendCode")}
              </Button>
            </Flex>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldNum}>{t("steps.passphraseNum")}</span>
            <SignupPasswordController />
          </div>

          <div className={styles.field}>
            <span className={styles.fieldNum}>{t("steps.passphraseNum")}</span>
            <SignupConfirmPasswordController />
          </div>

          <div className={styles.field}>
            <span className={styles.fieldNum}>{t("steps.issueNum")}</span>
            <Flex direction="column" gap="3">
              <SignupRememberController />
              <Button type="submit" size="3" loading={signup.isPending}>
                {t("submit")}
                <AnimatedIcon icon={ArrowNarrowRightIcon} size={16} />
              </Button>
            </Flex>
          </div>
        </form>
      </FormProvider>

      <Text as="p" size="2" color="gray">
        {t("hasAccount")}{" "}
        <Link
          href={ROUTES.LOGIN}
          size="2"
          onClick={(e) => {
            e.preventDefault();
            routerEventEmitter.navigate({ to: ROUTES.LOGIN });
          }}
        >
          {t("signIn")}
        </Link>
      </Text>
    </SignupShell>
  );
}

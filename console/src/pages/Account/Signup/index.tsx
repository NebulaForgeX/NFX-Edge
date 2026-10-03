import type { ReactNode } from "react";

import { AnimatedIcon, ArrowNarrowRightIcon } from "nfx-ui/icons";
import { Button, Flex, Grid, Heading, Link, Section, Text } from "@radix-ui/themes";
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

function LedgerField({ n, children }: { n: string; children: ReactNode }) {
  return (
    <Section size="1" mb="4" pt="0" pb="0">
      <Grid columns="var(--space-7) 1fr" gap="2">
        <Section size="1" pt="2" pb="0">
          <span className={styles.fieldNum}>{n}</span>
        </Section>
        {children}
      </Grid>
    </Section>
  );
}

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
      <Section size="1" mb="5" pb="4" pt="0" className={styles.sheetHead}>
        <Text as="p" size="1" weight="bold" className={styles.kicker}>
          {t("ledger.kicker")}
        </Text>
        <Heading as="h1" size="6">
          {t("ledger.title")}
        </Heading>
        <Text as="p" size="2" color="gray">
          {t("ledger.subtitle")}
        </Text>
      </Section>

      <FormProvider {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <LedgerField n={t("steps.verifyNum")}>
            <SignupEmailController helperText={t("emailHint")} />
          </LedgerField>

          <LedgerField n={t("steps.verifyNum")}>
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
          </LedgerField>

          <LedgerField n={t("steps.passphraseNum")}>
            <SignupPasswordController />
          </LedgerField>

          <LedgerField n={t("steps.passphraseNum")}>
            <SignupConfirmPasswordController />
          </LedgerField>

          <LedgerField n={t("steps.issueNum")}>
            <Flex direction="column" gap="3">
              <SignupRememberController />
              <Button type="submit" size="3" loading={signup.isPending}>
                {t("submit")}
                <AnimatedIcon icon={ArrowNarrowRightIcon} size={16} />
              </Button>
            </Flex>
          </LedgerField>
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

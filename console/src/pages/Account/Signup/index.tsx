import { AnimatedIcon, ArrowNarrowRightIcon } from "nfx-ui/icons";
import { Box, Button, Flex, Grid, Heading, Link, Section, Text } from "@radix-ui/themes";
import { AuthSignupPlatformEnum, LanguageEnum } from "nfx-ui/enums";
import { useSendVerificationCode, useSignupWithEmail } from "nfx-ui/hooks";
import { SignupFormData, useInitSignupForm } from "nfx-ui/schemas";
import { usePreferenceStore } from "nfx-ui/stores";
import { FormProvider, SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ProgressStepStateEnum } from "@/enums";
import { routerEventEmitter } from "@/events/router";
import {
  SignupConfirmPasswordController,
  SignupEmailController,
  SignupPasswordController,
  SignupRememberController,
  SignupVerificationCodeController,
} from "@/features/account";
import { useResendTimer, useSignupProgress } from "@/hooks";
import { ROUTES } from "@/navigations";
import AuthShell from "@/pages/Account/shared/AuthShell";

import IssueStepper from "./IssueStepper";
import SigningRequestPanel from "./SigningRequestPanel";
import styles from "./s.module.css";

const stepState = (done: boolean, active: boolean) => (done ? ProgressStepStateEnum.DONE : active ? ProgressStepStateEnum.ACTIVE : ProgressStepStateEnum.PENDING);

export default function SignupPage() {
  const { t } = useTranslation("pages.Account.Signup");
  const form = useInitSignupForm(t);
  const signup = useSignupWithEmail();
  const sendCode = useSendVerificationCode({ successMsg: t("toasts.sendVerificationCodeSuccess") });
  const resend = useResendTimer();
  const language = usePreferenceStore((s) => s.language);
  const { verified, secured, email } = useSignupProgress(form.control);

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

  const requestCode = () => {
    if (!email) return;
    sendCode.mutate({ email, lang: language ?? LanguageEnum.EN }, { onSuccess: () => resend.startTimer() });
  };

  const steps = [
    { n: t("steps.verifyNum"), label: t("steps.verify"), hint: t("steps.verifyHint"), state: stepState(verified, true) },
    { n: t("steps.passphraseNum"), label: t("steps.passphrase"), hint: t("steps.passphraseHint"), state: stepState(secured, verified) },
    { n: t("steps.issueNum"), label: t("steps.issue"), hint: t("steps.issueHint"), state: stepState(false, secured) },
  ];

  return (
    <AuthShell product={t("rail.product")} aside={<SigningRequestPanel email={email} verified={verified} secured={secured} />}>
      <Flex direction="column" gap="6" width="100%">
        <Flex direction="column" gap="2" className="js-auth-item">
          <Text as="span" className={styles.kicker}>
            {t("ledger.kicker")}
          </Text>
          <Heading as="h1" size="7" weight="bold" className={styles.title}>
            {t("ledger.title")}
          </Heading>
          <Text as="p" size="2" color="gray" className={styles.lede}>
            {t("ledger.subtitle")}
          </Text>
        </Flex>

        <Box className="js-auth-item">
          <IssueStepper steps={steps} ariaLabel={t("steps.aria")} />
        </Box>

        <FormProvider {...form}>
          <Flex asChild direction="column" gap="4" className="js-auth-item">
            <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
              <SignupEmailController helperText={t("emailHint")} />
              <SignupVerificationCodeController
                action={
                  <Button type="button" size="3" variant="outline" loading={sendCode.isPending} disabled={!email || !resend.canResend} onClick={requestCode} className={styles.sendCode}>
                    {resend.canResend ? t("sendCode") : `${resend.timeLeft}s`}
                  </Button>
                }
              />
              <Grid columns="2" gap="3">
                <SignupPasswordController />
                <SignupConfirmPasswordController />
              </Grid>
              <SignupRememberController />
              <Button type="submit" size="3" loading={signup.isPending} className={styles.submit}>
                {t("submit")}
                <AnimatedIcon icon={ArrowNarrowRightIcon} size={16} />
              </Button>
            </form>
          </Flex>
        </FormProvider>

        <Section size="1" pt="4" pb="0" className={`${styles.foot} js-auth-item`}>
          <Flex align="center" justify="between" gap="3">
            <Text as="p" size="2" color="gray">
              {t("hasAccount")}
            </Text>
            <Link
              href={ROUTES.LOGIN}
              size="2"
              weight="medium"
              onClick={(e) => {
                e.preventDefault();
                routerEventEmitter.navigate({ to: ROUTES.LOGIN });
              }}
            >
              {t("signIn")}
            </Link>
          </Flex>
        </Section>
      </Flex>
    </AuthShell>
  );
}

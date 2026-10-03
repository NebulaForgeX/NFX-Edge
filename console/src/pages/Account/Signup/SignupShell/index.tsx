import type { ReactNode } from "react";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Box, Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import gsap from "gsap";
import { APP_NAME } from "nfx-ui/config";
import { useTranslation } from "react-i18next";

import { Logo, PreferencesPopover } from "@/components";

import styles from "./s.module.css";

gsap.registerPlugin(useGSAP);

function IssueStep({ n, label, hint }: { n: string; label: string; hint: string }) {
  return (
    <Flex asChild flexGrow="1" className={`${styles.stepItem} js-issue-step`}>
      <li>
        <Flex direction={{ initial: "column", sm: "row" }} align={{ initial: "center", sm: "start" }} gap={{ initial: "2", sm: "3" }}>
          <Flex className={styles.stepNum} align="center" justify="center" flexShrink="0" width="var(--space-7)" height="var(--space-7)">
            {n}
          </Flex>
          <Section size="1" pt={{ initial: "0", sm: "1" }} pb="0">
            <Flex direction="column" gap="1" align={{ initial: "center", sm: "start" }}>
              <Text size="2" weight="bold">
                {label}
              </Text>
              <Text size="1" color="gray">
                {hint}
              </Text>
            </Flex>
          </Section>
        </Flex>
      </li>
    </Flex>
  );
}

export default function SignupShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation("pages.Account.Signup");
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.set(".js-issue-step", { autoAlpha: 0, y: 16 });
      gsap.set(".js-issue-form", { autoAlpha: 0, y: 22 });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(".js-issue-step", { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.12 }).to(".js-issue-form", { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.2");
    },
    { scope: pageRef },
  );

  return (
    <Flex ref={pageRef} direction="column" className={styles.page} asChild>
      <main>
        <Box asChild className={styles.rail} >
          <header>
            <Container size="4" width="100%" maxWidth="100%" px="5" >
              <Section size="1" py="3">
                <Flex align="center" justify="between" gap="4">
                  <Flex align="center" gap="3">
                    <Logo variant="glassSquare" size="small" alt={`${APP_NAME} logo`} />
                    <Text as="span" className={styles.product}>
                      {t("rail.product")}
                    </Text>
                  </Flex>
                  <PreferencesPopover />
                </Flex>
              </Section>
            </Container>
          </header>
        </Box>

        <Section size="1" pt={{ initial: "4", sm: "7" }} pb="8">
          <Container size="4" width="100%" maxWidth="100%" px="5" >
            <Grid columns={{ initial: "1fr", sm: "11rem minmax(0, 32rem)" }} justify="center" gap="6" width="100%">
              <Section size="1" pt={{ initial: "0", sm: "8" }} pb="0" position="relative">
                <Box display={{ initial: "none", sm: "block" }} className={styles.stepLine} />
                <Flex asChild direction={{ initial: "row", sm: "column" }} justify={{ initial: "between", sm: "start" }} gap={{ initial: "3", sm: "6" }} className={styles.steps}>
                  <ol aria-label={t("steps.aria")}>
                    <IssueStep n={t("steps.verifyNum")} label={t("steps.verify")} hint={t("steps.verifyHint")} />
                    <IssueStep n={t("steps.passphraseNum")} label={t("steps.passphrase")} hint={t("steps.passphraseHint")} />
                    <IssueStep n={t("steps.issueNum")} label={t("steps.issue")} hint={t("steps.issueHint")} />
                  </ol>
                </Flex>
              </Section>
              <Box className={styles.sheet}>
                <Section size="1" py="6">
                  <Container size="4" width="100%" maxWidth="100%" px="6" >
                    <section className="js-issue-form">{children}</section>
                  </Container>
                </Section>
              </Box>
            </Grid>
          </Container>
        </Section>
      </main>
    </Flex>
  );
}

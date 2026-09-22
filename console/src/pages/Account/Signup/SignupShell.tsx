import type { ReactNode } from "react";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Box, Text } from "@radix-ui/themes";
import gsap from "gsap";
import { APP_NAME } from "nfx-ui/config";
import { useTranslation } from "react-i18next";

import { Logo, PreferencesPopover } from "@/components";

import styles from "./s.module.css";

gsap.registerPlugin(useGSAP);

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
    <Box ref={pageRef} className={styles.page} asChild>
      <main>
        <header className={styles.rail}>
          <div className={styles.brand}>
            <Logo variant="glassSquare" size="small" alt={`${APP_NAME} logo`} />
            <Text as="span" className={styles.product}>
              {t("rail.product")}
            </Text>
          </div>
          <PreferencesPopover />
        </header>

        <div className={styles.body}>
          <ol className={styles.stepRail} aria-label={t("steps.aria")}>
            <li className={`${styles.step} js-issue-step`}>
              <span className={styles.stepNum}>{t("steps.verifyNum")}</span>
              <span className={styles.stepCopy}>
                <span className={styles.stepLabel}>{t("steps.verify")}</span>
                <span className={styles.stepHint}>{t("steps.verifyHint")}</span>
              </span>
            </li>
            <li className={`${styles.step} js-issue-step`}>
              <span className={styles.stepNum}>{t("steps.passphraseNum")}</span>
              <span className={styles.stepCopy}>
                <span className={styles.stepLabel}>{t("steps.passphrase")}</span>
                <span className={styles.stepHint}>{t("steps.passphraseHint")}</span>
              </span>
            </li>
            <li className={`${styles.step} js-issue-step`}>
              <span className={styles.stepNum}>{t("steps.issueNum")}</span>
              <span className={styles.stepCopy}>
                <span className={styles.stepLabel}>{t("steps.issue")}</span>
                <span className={styles.stepHint}>{t("steps.issueHint")}</span>
              </span>
            </li>
          </ol>
          <section className={`${styles.sheet} js-issue-form`}>{children}</section>
        </div>
      </main>
    </Box>
  );
}

import type { ReactNode } from "react";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Box, Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import gsap from "gsap";
import { APP_NAME } from "nfx-ui/config";
import { useTranslation } from "react-i18next";

import { Logo, PreferencesPopover } from "@/components";

import styles from "./s.module.css";

gsap.registerPlugin(useGSAP);

const PEM_FILL =
  "MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAwTzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2VhcmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJuZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBYMTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygch77ct984kIxuPOZXoHj3dcKi".repeat(
    6,
  );

const FACSIMILE_ROWS = [
  ["facsimile.issuerLabel", "facsimile.issuer"],
  ["facsimile.subjectLabel", "facsimile.subject"],
  ["facsimile.notAfterLabel", "facsimile.notAfter"],
  ["facsimile.serialLabel", "facsimile.serial"],
] as const;

export default function LoginShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation("pages.Account.Login");
  const pageRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(() => window.matchMedia("(max-width: 960px)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 960px)");
    const sync = () => setNarrow(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.set(".js-unlock-form", { autoAlpha: 0, x: -28 });
      gsap.set(".js-pem", { autoAlpha: 0, y: 18, scale: 0.985 });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(".js-unlock-form", { autoAlpha: 1, x: 0, duration: 0.5 }).to(".js-pem", { autoAlpha: 1, y: 0, scale: 1, duration: 0.7 }, "-=0.22");
    },
    { scope: pageRef },
  );

  return (
    <Flex ref={pageRef} direction="column" className={styles.page} asChild>
      <main>
        <Box className={styles.rail} >
          <Container size="4" width="100%" maxWidth="100%" px="6" >
            <Section size="1" py="3">
              <Flex asChild align="center" justify="between" gap="4">
                <header>
                  <Flex align="center" gap="3" minWidth="0">
                    <Logo variant="glassSquare" size="small" alt={`${APP_NAME} logo`} />
                    <Text as="span" className={styles.product}>
                      {t("rail.product")}
                    </Text>
                  </Flex>
                  <PreferencesPopover />
                </header>
              </Flex>
            </Section>
          </Container>
        </Box>

        <Flex flexGrow="1" minHeight="0" minWidth="0" width="100%" overflow="hidden">
          <Flex direction="column" flexGrow="1" flexBasis="0" minWidth="0" className={styles.protocol} data-narrow={narrow ? "true" : undefined} overflow="auto">
            <Container size="4" width="100%" maxWidth="100%" px="6">
              <Section size="1" py="6">
                <Box width="100%" minWidth="0" className="js-unlock-form">
                  {children}
                </Box>
                {narrow ? (
                  <Section size="1" pt="6" pb="0">
                    <Text as="p" className={styles.pemSummaryText}>
                      {t("facsimile.summary")}
                    </Text>
                  </Section>
                ) : null}
              </Section>
            </Container>
          </Flex>

          {narrow ? null : (
            <Flex direction="column" flexGrow="1" flexBasis="0" minWidth="0" minHeight="0" className={styles.stage}>
              <Flex asChild className="js-pem" flexGrow="1" minHeight="0" minWidth="0" width="100%">
                <aside aria-hidden>
                  <Container className={styles.stretch} size="4" width="100%" maxWidth="100%" height="100%" px="6">
                    <Section className={styles.stretch} size="1" height="100%" py="6">
                      <Flex direction="column" className={`${styles.stretch} ${styles.sheet}`} flexGrow="1" width="100%" minWidth="0" minHeight="0" position="relative" overflow="hidden">
                        <span className={styles.cornerTl} />
                        <span className={styles.cornerTr} />
                        <span className={styles.cornerBl} />
                        <span className={styles.cornerBr} />
                        <Container className={styles.stretch} size="4" width="100%" maxWidth="100%" height="100%" px="5">
                          <Section className={styles.stretch} size="1" height="100%" py="5">
                            <Flex direction="column" height="100%" minHeight="0" minWidth="0" width="100%" gap="4">
                              <Section size="1" pb="3" pt="0" className={styles.sheetTop}>
                                <Flex align="baseline" justify="between" gap="4" minWidth="0">
                                  <span className={styles.sheetKind}>{t("facsimile.kind")}</span>
                                  <span className={styles.sheetTopMeta}>{t("rail.tls")} · {t("rail.dns")} · {t("rail.file")}</span>
                                </Flex>
                              </Section>
                              <Grid className={styles.meta} columns="2" gap="4" width="100%">
                                {FACSIMILE_ROWS.map(([labelKey, valueKey]) => (
                                  <Flex key={labelKey} direction="column" gap="1" minWidth="0">
                                    <span className={styles.pemKey}>{t(labelKey)}</span>
                                    <span className={styles.pemVal}>{t(valueKey)}</span>
                                  </Flex>
                                ))}
                              </Grid>
                              <Flex flexGrow="1" minHeight="0" minWidth="0" width="100%" overflow="hidden">
                                <Text as="p" className={styles.pemBody}>
                                  {PEM_FILL}
                                </Text>
                              </Flex>
                              <Section size="1" pt="3" pb="0" className={styles.sheetFoot}>
                                <Flex align="center" justify="between" gap="4" minWidth="0" width="100%">
                                  <span className={styles.pemBegin}>{t("facsimile.algo")}</span>
                                  <span className={styles.pemVal}>
                                    {t("facsimile.fingerprintLabel")} {t("facsimile.fingerprint")}
                                  </span>
                                </Flex>
                              </Section>
                            </Flex>
                          </Section>
                        </Container>
                        <span className={styles.watermark}>{t("facsimile.watermark")}</span>
                      </Flex>
                    </Section>
                  </Container>
                </aside>
              </Flex>
            </Flex>
          )}
        </Flex>
      </main>
    </Flex>
  );
}

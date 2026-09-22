import type { ReactNode } from "react";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Box, Flex, Text } from "@radix-ui/themes";
import gsap from "gsap";
import { APP_NAME } from "nfx-ui/config";
import { useTranslation } from "react-i18next";

import { Logo, PreferencesPopover } from "@/components";

import styles from "./s.module.css";

gsap.registerPlugin(useGSAP);

const PEM_CHUNK =
  "MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAwTzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2VhcmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJuZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBYMTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygch77ct984kIxuPOZXoHj3dcKi";

const PEM_FILL = Array.from({ length: 8 }, () => PEM_CHUNK).join("");

export default function LoginShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation("pages.Account.Login");
  const pageRef = useRef<HTMLDivElement>(null);

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
    <Box ref={pageRef} className={styles.page} asChild>
      <main>
        <Flex direction="column" height="100%">
          <Box className={styles.railHairline}>
            <Box className={styles.railPx}>
              <Box className={styles.railPy}>
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
              </Box>
            </Box>
          </Box>

          <Box className={styles.bodyFill}>
            <Box className={styles.body}>
              <Box className={styles.protocolRule}>
                <Box className={styles.protocolClip}>
                  <Box className={styles.protocolPx}>
                    <Box className={styles.protocolPy}>
                      <Box width="100%" className="js-unlock-form">
                        {children}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box asChild className={`${styles.stage} js-pem`}>
                <aside aria-hidden>
                  <Box className={styles.stagePx} height="100%">
                    <Box className={styles.stagePy} height="100%">
                      <Box className={styles.stageFill}>
                        <Box className={styles.sheet}>
                          <span className={`${styles.corner} ${styles.cornerTl}`} />
                          <span className={`${styles.corner} ${styles.cornerTr}`} />
                          <span className={`${styles.corner} ${styles.cornerBl}`} />
                          <span className={`${styles.corner} ${styles.cornerBr}`} />
                          <Box className={styles.sheetPx} height="100%">
                            <Box className={styles.sheetPy} height="100%">
                              <Box className={styles.sheetGrid}>
                                <Box className={styles.sheetTopRule}>
                                  <Box className={styles.sheetTopPy}>
                                    <Flex align="baseline" justify="between" gap="4">
                                      <span className={styles.sheetKind}>{t("facsimile.kind")}</span>
                                      <span className={styles.sheetTopMeta}>
                                        {t("rail.tls")} · {t("rail.dns")} · {t("rail.file")}
                                      </span>
                                    </Flex>
                                  </Box>
                                </Box>
                                <Box className={styles.sheetMetaPy}>
                                  <Box className={styles.sheetMeta}>
                                    <div className={styles.metaItem}>
                                      <span className={styles.pemKey}>{t("facsimile.issuerLabel")}</span>
                                      <span className={styles.pemVal}>{t("facsimile.issuer")}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                      <span className={styles.pemKey}>{t("facsimile.subjectLabel")}</span>
                                      <span className={styles.pemVal}>{t("facsimile.subject")}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                      <span className={styles.pemKey}>{t("facsimile.notAfterLabel")}</span>
                                      <span className={styles.pemVal}>{t("facsimile.notAfter")}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                      <span className={styles.pemKey}>{t("facsimile.serialLabel")}</span>
                                      <span className={styles.pemVal}>{t("facsimile.serial")}</span>
                                    </div>
                                  </Box>
                                </Box>
                                <pre className={styles.pemBody}>{PEM_FILL}</pre>
                                <Box className={styles.sheetFootRule}>
                                  <Box className={styles.sheetFootPy}>
                                    <Flex align="center" justify="between" gap="4" className={styles.sheetFoot}>
                                      <span className={styles.pemBegin}>{t("facsimile.algo")}</span>
                                      <span>
                                        {t("facsimile.fingerprintLabel")} {t("facsimile.fingerprint")}
                                      </span>
                                    </Flex>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <span className={styles.watermark}>{t("facsimile.watermark")}</span>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </aside>
              </Box>
            </Box>
          </Box>

          <Box className={styles.pemSummaryRule}>
            <Box className={styles.pemSummaryPx}>
              <Box className={styles.pemSummaryPy}>
                <Text as="p" className={styles.pemSummary}>
                  {t("facsimile.summary")}
                </Text>
              </Box>
            </Box>
          </Box>
        </Flex>
      </main>
    </Box>
  );
}

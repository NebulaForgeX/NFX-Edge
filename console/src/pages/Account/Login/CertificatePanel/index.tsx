import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Badge, Box, Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useTranslation } from "react-i18next";

import styles from "./s.module.css";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

const HEX_CHARS = "0123456789ABCDEF:";

const META_ROWS = [
  ["facsimile.issuerLabel", "facsimile.issuer"],
  ["facsimile.subjectLabel", "facsimile.subject"],
  ["facsimile.notAfterLabel", "facsimile.notAfter"],
  ["facsimile.serialLabel", "facsimile.serial"],
] as const;

const SCOPES = ["rail.tls", "rail.dns", "rail.file"] as const;

/** Desktop aside of the unlock page: an X.509 inspector for the console's own certificate. */
export default function CertificatePanel() {
  const { t, i18n } = useTranslation("pages.Account.Login");
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ delay: 0.55, defaults: { ease: "power3.out" } });
        tl.from(".js-cert-row", { autoAlpha: 0, y: 6, duration: 0.4, stagger: 0.06, clearProps: "opacity,visibility,transform" });
        gsap.utils.toArray<HTMLElement>(".js-cert-scramble").forEach((node) => {
          tl.to(node, { duration: 1.1, scrambleText: { text: node.textContent ?? "", chars: HEX_CHARS, revealDelay: 0.25, speed: 0.6 } }, "<0.1");
        });
        tl.fromTo(".js-cert-stamp", { autoAlpha: 0, scale: 1.25, rotation: -14 }, { autoAlpha: 1, scale: 1, rotation: -6, duration: 0.5, ease: "back.out(2)" }, "-=0.4");
        gsap.fromTo(".js-cert-scan", { yPercent: 0 }, { yPercent: 100, duration: 6, ease: "none", repeat: -1 });
      });
      return () => media.revert();
    },
    { scope: rootRef, dependencies: [i18n.language] },
  );

  return (
    <Section ref={rootRef} size="1" py="8" className={styles.panel}>
      <Container size="3" px="8">
        <Flex direction="column" gap="5">
          <Flex align="center" justify="between" gap="4" className="js-cert-row">
            <Text as="span" className={styles.kind}>
              {t("facsimile.kind")}
            </Text>
            <Flex gap="2">
              {SCOPES.map((key) => (
                <Badge key={key} variant="outline" color="gray" size="1" className={styles.scope}>
                  {t(key)}
                </Badge>
              ))}
            </Flex>
          </Flex>

          <Box position="relative" overflow="hidden" className={styles.sheet}>
            <Box className={`${styles.scanTrack} js-cert-scan`}>
              <Box className={styles.scanLine} />
            </Box>
            <Section size="1" py="6">
              <Container size="4" px="6">
                <Flex direction="column" gap="5">
                  <Text as="span" className={`${styles.marker} js-cert-row`}>
                    {t("facsimile.begin")}
                  </Text>

                  <Grid columns="repeat(2, minmax(0, 1fr))" gapX="6" gapY="4" className="js-cert-row">
                    {META_ROWS.map(([labelKey, valueKey]) => (
                      <Section key={labelKey} size="1" pt="3" pb="0" minWidth="0" className={styles.metaCell}>
                        <Flex direction="column" gap="1" minWidth="0">
                          <Text as="span" className={styles.metaLabel}>
                            {t(labelKey)}
                          </Text>
                          <Text as="span" key={t(valueKey)} className={`${styles.metaValue} ${valueKey === "facsimile.serial" ? "js-cert-scramble" : ""}`}>
                            {t(valueKey)}
                          </Text>
                        </Flex>
                      </Section>
                    ))}
                  </Grid>

                  <Text as="p" className={`${styles.pem} js-cert-row`}>
                    {t("facsimile.body")}
                  </Text>

                  <Text as="span" className={`${styles.marker} js-cert-row`}>
                    {t("facsimile.end")}
                  </Text>

                  <Section size="1" pt="4" pb="0" className={`${styles.foot} js-cert-row`}>
                    <Flex align="center" justify="between" gap="4" minWidth="0">
                      <Text as="span" className={styles.footValue}>
                        {t("facsimile.algo")}
                      </Text>
                      <Flex align="center" gap="2" minWidth="0">
                        <Text as="span" className={styles.metaLabel}>
                          {t("facsimile.fingerprintLabel")}
                        </Text>
                        <Text as="span" key={t("facsimile.fingerprint")} className={`${styles.footValue} js-cert-scramble`}>
                          {t("facsimile.fingerprint")}
                        </Text>
                      </Flex>
                    </Flex>
                  </Section>
                </Flex>
              </Container>
            </Section>
            <Flex align="center" justify="center" className={`${styles.stamp} js-cert-stamp`}>
              {t("facsimile.watermark")}
            </Flex>
          </Box>

          <Text as="p" className={`${styles.summary} js-cert-row`}>
            {t("facsimile.summary")}
          </Text>
        </Flex>
      </Container>
    </Section>
  );
}

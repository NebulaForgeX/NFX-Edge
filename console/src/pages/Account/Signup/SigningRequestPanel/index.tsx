import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Badge, Box, Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import gsap from "gsap";
import { useTranslation } from "react-i18next";

import styles from "./s.module.css";

gsap.registerPlugin(useGSAP);

export type SigningRequestPanelProps = {
  email: string;
  verified: boolean;
  secured: boolean;
};

/** Desktop aside of the issue page: the signing request assembles as the form fills in. */
export default function SigningRequestPanel({ email, verified, secured }: SigningRequestPanelProps) {
  const { t } = useTranslation("pages.Account.Signup");
  const { t: tCert } = useTranslation("pages.Account.Login");
  const rootRef = useRef<HTMLDivElement>(null);

  const activeNum = secured ? t("steps.issueNum") : verified ? t("steps.passphraseNum") : t("steps.verifyNum");
  const subject = email ? `CN=${email}` : "CN=—";
  const cells = [
    { key: "subject", label: tCert("facsimile.subjectLabel"), value: subject, lit: verified },
    { key: "issuer", label: tCert("facsimile.issuerLabel"), value: tCert("facsimile.issuer"), lit: true },
    { key: "notAfter", label: tCert("facsimile.notAfterLabel"), value: tCert("facsimile.notAfter"), lit: secured },
    { key: "serial", label: tCert("facsimile.serialLabel"), value: tCert("facsimile.serial"), lit: secured },
  ];

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".js-csr-row", { autoAlpha: 0, y: 6, duration: 0.4, stagger: 0.06, delay: 0.55, ease: "power3.out", clearProps: "opacity,visibility,transform" });
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.45;
      gsap.to(".js-csr-cell[data-lit='true']", { opacity: 1, duration, ease: "power2.out" });
      gsap.to(".js-csr-cell[data-lit='false']", { opacity: 0.35, duration, ease: "power2.out" });
    },
    { scope: rootRef, dependencies: [verified, secured], revertOnUpdate: false },
  );

  return (
    <Section ref={rootRef} size="1" py="8" className={styles.panel}>
      <Container size="3" px="8">
        <Flex direction="column" gap="5">
          <Flex align="center" justify="between" gap="4" className="js-csr-row">
            <Text as="span" className={styles.kind}>
              {t("ledger.kicker")}
            </Text>
            <Badge variant="outline" size="1" className={styles.step}>
              {activeNum}
            </Badge>
          </Flex>

          <Box className={`${styles.sheet} js-csr-row`}>
            <Section size="1" py="6">
              <Container size="4" px="6">
                <Flex direction="column" gap="5">
                  <Text as="span" className={styles.marker}>
                    {tCert("facsimile.begin")}
                  </Text>

                  <Grid columns="repeat(2, minmax(0, 1fr))" gapX="6" gapY="4">
                    {cells.map((cell) => (
                      <Section key={cell.key} size="1" pt="3" pb="0" minWidth="0" data-lit={cell.lit} className={`${styles.cell} js-csr-cell`}>
                        <Flex direction="column" gap="1" minWidth="0">
                          <Text as="span" className={styles.label}>
                            {cell.label}
                          </Text>
                          <Text as="span" className={styles.value} title={cell.value}>
                            {cell.value}
                          </Text>
                        </Flex>
                      </Section>
                    ))}
                  </Grid>

                  <Box data-lit={secured} className={`${styles.pemBlock} js-csr-cell`}>
                    <Text as="p" className={styles.pem}>
                      {tCert("facsimile.body")}
                    </Text>
                  </Box>

                  <Text as="span" className={styles.marker}>
                    {tCert("facsimile.end")}
                  </Text>

                  <Section size="1" pt="4" pb="0" data-lit={secured} className={`${styles.foot} js-csr-cell`}>
                    <Flex align="center" justify="between" gap="4" minWidth="0">
                      <Text as="span" className={styles.footValue}>
                        {tCert("facsimile.algo")}
                      </Text>
                      <Text as="span" className={styles.footValue}>
                        {tCert("facsimile.fingerprintLabel")} {tCert("facsimile.fingerprint")}
                      </Text>
                    </Flex>
                  </Section>
                </Flex>
              </Container>
            </Section>
          </Box>

          <Text as="p" className={`${styles.summary} js-csr-row`}>
            {tCert("facsimile.summary")}
          </Text>
        </Flex>
      </Container>
    </Section>
  );
}

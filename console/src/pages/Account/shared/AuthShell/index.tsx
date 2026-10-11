import type { ReactNode } from "react";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Box, Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import gsap from "gsap";
import { APP_NAME } from "nfx-ui/config";

import { Logo, PreferencesPopover } from "@/components";

import styles from "./s.module.css";

gsap.registerPlugin(useGSAP);

export type AuthShellProps = {
  /** Product label next to the logo (`rail.product` of the page namespace). */
  product: string;
  /** Desktop-only security panel. */
  aside: ReactNode;
  children: ReactNode;
};

/** Edge unlock / issue gate: 100dvh, form column on the left, product panel on the right (≥1024px). */
export default function AuthShell({ product, aside, children }: AuthShellProps) {
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".js-auth-item", { autoAlpha: 0, y: 8, duration: 0.45, stagger: 0.05, clearProps: "opacity,visibility,transform" }).fromTo(
          ".js-auth-aside",
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power4.inOut", clearProps: "clipPath" },
          0.1,
        );
      });
      return () => media.revert();
    },
    { scope: pageRef },
  );

  return (
    <Flex ref={pageRef} direction="column" className={styles.page} asChild>
      <main>
        <Box className={styles.rail}>
          <Container size="4" width="100%" maxWidth="100%" px="6">
            <Section size="1" py="3">
              <Flex asChild align="center" justify="between" gap="4">
                <header>
                  <Flex align="center" gap="3" minWidth="0">
                    <Logo variant="glassSquare" size="small" alt={`${APP_NAME} logo`} />
                    <Text as="span" className={styles.product}>
                      {product}
                    </Text>
                  </Flex>
                  <PreferencesPopover />
                </header>
              </Flex>
            </Section>
          </Container>
        </Box>

        <Grid columns={{ initial: "minmax(0, 1fr)", md: "minmax(0, 5fr) minmax(0, 7fr)" }} rows="minmax(0, 1fr)" flexGrow="1" minHeight="0" width="100%">
          <Flex direction="column" minHeight="0" overflow="auto" className={`${styles.formColumn} ${styles.centered}`}>
            <Box width="100%">
              <Container size="1" px="6">
                <Section size="1" py="7">
                  {children}
                </Section>
              </Container>
            </Box>
          </Flex>

          <Flex asChild display={{ initial: "none", md: "flex" }} direction="column" minHeight="0" minWidth="0" overflow="auto" className={`${styles.aside} ${styles.centered} js-auth-aside`}>
            <aside aria-hidden>{aside}</aside>
          </Flex>
        </Grid>
      </main>
    </Flex>
  );
}

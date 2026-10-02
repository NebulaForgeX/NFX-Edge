import type { ReactNode } from "react";

import { Box, Container, Flex, Section } from "@radix-ui/themes";

import styles from "./s.module.css";

type ActionBarProps = {
  status?: ReactNode;
  children?: ReactNode;
};

export default function ActionBar({ status, children }: ActionBarProps) {
  return (
    <Box className={styles.bar}>
      <Container size="4" width="100%" maxWidth="100%" px="4">
        <Section size="1" py="3">
          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <Flex align="center" gap="2" minWidth="0">
              {status}
            </Flex>
            <Flex align="center" justify="end" gap="2" wrap="wrap">
              {children}
            </Flex>
          </Flex>
        </Section>
      </Container>
    </Box>
  );
}

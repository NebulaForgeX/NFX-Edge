import type { ReactNode } from "react";

import { Card, Flex, Heading, Section, Text } from "@radix-ui/themes";

import styles from "./s.module.css";

export interface FormSectionProps {
  step?: number;
  title: string;
  hint?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export default function FormSection({ step, title, hint, children, footer }: FormSectionProps) {
  return (
    <Card size="3" variant="surface">
      <Flex direction="column" gap="5">
        <Flex align="start" gap="3">
          {step !== undefined ? (
            <Flex align="center" justify="center" flexShrink="0" className={styles.step}>
              <Text size="2" weight="bold">
                {step}
              </Text>
            </Flex>
          ) : null}
          <Flex direction="column" gap="1" minWidth="0">
            <Heading as="h2" size="3" weight="bold">
              {title}
            </Heading>
            {hint ? (
              <Text as="p" size="2" color="gray" className={styles.hint}>
                {hint}
              </Text>
            ) : null}
          </Flex>
        </Flex>
        {children}
        {footer ? (
          <Section size="1" pt="4" pb="0" className={styles.footer}>
            <Flex justify="end" align="center" gap="2" wrap="wrap">
              {footer}
            </Flex>
          </Section>
        ) : null}
      </Flex>
    </Card>
  );
}

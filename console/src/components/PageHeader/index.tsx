import type { ReactNode } from "react";

import { Flex, Heading, Section, Text } from "@radix-ui/themes";
import { AnimatedIcon, type AnimatedIconComponent } from "nfx-ui/icons";

import styles from "./s.module.css";

export type PageHeaderProps = {
  icon: AnimatedIconComponent;
  title: string;
  description?: string;
  actions?: ReactNode;
  index?: string;
  density?: "default" | "panel";
};

export default function PageHeader({ icon, title, description, actions, index, density = "panel" }: PageHeaderProps) {
  const compact = density === "panel";
  return (
    <Section size="1" pb="5" width="100%" className={styles.hairline}>
      <Flex direction="column" gap="4">
        <Flex align="start" gap="4" minWidth="0">
          <Flex align="center" justify="center" className={styles.stamp}>
            <AnimatedIcon icon={icon} size={compact ? 15 : 18} />
          </Flex>
          <Flex direction="column" gap="2" minWidth="0">
            {index ? (
              <Text as="span" size="1" className={styles.index}>
                {index}
              </Text>
            ) : null}
            <Heading as="h1" size="7" className={styles.title}>
              {title}
            </Heading>
            {description ? (
              <Text as="p" size="2" color="gray" className={styles.lede}>
                {description}
              </Text>
            ) : null}
          </Flex>
        </Flex>
        {actions ? (
          <Flex gap="2" wrap="wrap" align="center">
            {actions}
          </Flex>
        ) : null}
      </Flex>
    </Section>
  );
}

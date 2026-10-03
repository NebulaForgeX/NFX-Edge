import type { ReactNode } from "react";

import { Badge, Flex, Heading, Section, Text } from "@radix-ui/themes";
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
    <Section size="1" pt="2" pb="5" width="100%" className={styles.hairline}>
      <Flex direction={{ initial: "column", md: "row" }} align={{ initial: "start", md: "end" }} justify="between" gap="4">
        <Flex align="center" gap="4" minWidth="0">
          <Flex align="center" justify="center" flexShrink="0" className={compact ? styles.stamp : styles.stampLarge}>
            <AnimatedIcon icon={icon} size={compact ? 20 : 24} />
          </Flex>
          <Flex direction="column" gap="2" minWidth="0">
            {index ? (
              <Badge variant="surface" radius="full" size="1">
                {index}
              </Badge>
            ) : null}
            <Heading as="h1" size={compact ? "7" : "8"} weight="bold">
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
          <Flex gap="2" wrap="wrap" align="center" flexShrink="0">
            {actions}
          </Flex>
        ) : null}
      </Flex>
    </Section>
  );
}

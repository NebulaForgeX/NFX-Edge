import type { AnimatedIconComponent } from "nfx-ui/icons";
import type { ReactNode } from "react";

import { memo } from "react";
import { Card, Flex, Text } from "@radix-ui/themes";
import { AnimatedIcon } from "nfx-ui/icons";

import styles from "./s.module.css";

export interface SideCardProps {
  icon?: AnimatedIconComponent;
  title?: ReactNode;
  caption?: ReactNode;
  children?: ReactNode;
}

const SideCard = memo(({ icon, title, caption, children }: SideCardProps) => (
  <Card size="3" variant="classic" className={styles.side}>
    <Flex direction="column" gap="4">
      {icon || title ? (
        <Flex align="center" gap="3" minWidth="0">
          {icon ? (
            <Flex align="center" justify="center" flexShrink="0" className={styles.stamp}>
              <AnimatedIcon icon={icon} size={18} />
            </Flex>
          ) : null}
          <Flex direction="column" gap="1" minWidth="0">
            {title ? (
              <Text size="3" weight="bold" truncate>
                {title}
              </Text>
            ) : null}
            {caption ? (
              <Text size="1" color="gray" className={styles.caption}>
                {caption}
              </Text>
            ) : null}
          </Flex>
        </Flex>
      ) : null}
      {children}
    </Flex>
  </Card>
));

SideCard.displayName = "SideCard";

export default SideCard;

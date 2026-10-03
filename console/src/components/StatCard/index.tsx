import type { AnimatedIconComponent } from "nfx-ui/icons";
import type { ReactNode } from "react";

import { memo } from "react";
import { Card, Flex, Text } from "@radix-ui/themes";
import { AnimatedIcon } from "nfx-ui/icons";

import { AnimatedNumber } from "@/animations";

import styles from "./s.module.css";

export type StatCardTone = "accent" | "amber" | "red" | "green" | "gray";

export interface StatCardProps {
  icon: AnimatedIconComponent;
  label: string;
  value: number | string;
  tone?: StatCardTone;
  suffix?: ReactNode;
}

const StatCard = memo(({ icon, label, value, tone = "accent", suffix }: StatCardProps) => (
  <Card size="3" variant="surface" className={styles.stat}>
    <Flex align="center" justify="between" gap="3">
      <Flex direction="column" gap="2" minWidth="0">
        <Text size="1" weight="medium" color="gray" className={styles.label}>
          {label}
        </Text>
        <Flex align="baseline" gap="2" wrap="wrap">
          <Text size="8" weight="bold" className={styles.value}>
            {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
          </Text>
          {suffix ? (
            <Text size="3" color="gray">
              {suffix}
            </Text>
          ) : null}
        </Flex>
      </Flex>
      <Flex align="center" justify="center" flexShrink="0" className={styles.icon} data-tone={tone}>
        <AnimatedIcon icon={icon} size={20} />
      </Flex>
    </Flex>
  </Card>
));

StatCard.displayName = "StatCard";

export default StatCard;

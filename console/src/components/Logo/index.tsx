import { ReactNode } from "react";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { APP_NAME } from "nfx-ui/config";
import { useResolvedAppearance } from "nfx-ui/hooks";

import { getLogoSrc } from "@/constants";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";

import styles from "./s.module.css";

export interface LogoProps {
  to?: string;
  alt?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  variant?: "plain" | "glassSquare" | "glassCircle";
  size?: "small" | "medium" | "large";
  className?: string;
  onClick?: () => void;
}

const VARIANT_CLASS: Record<NonNullable<LogoProps["variant"]>, string> = {
  plain: styles.plain,
  glassSquare: styles.glassSquare,
  glassCircle: styles.glassCircle,
};

const SIZE_CLASS: Record<NonNullable<LogoProps["size"]>, string> = {
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
};

function Logo({ to = ROUTES.HOME, alt = `${APP_NAME} logo`, title, subtitle, variant = "plain", size = "medium", className = "", onClick }: LogoProps) {
  const appearance = useResolvedAppearance();

  return (
    <Flex asChild align="center" gap="3" width="fit-content">
      <Button
        type="button"
        variant="ghost"
        className={[styles.logo, className].filter(Boolean).join(" ")}
        aria-label={typeof title === "string" ? title : APP_NAME}
        onClick={() => {
          routerEventEmitter.navigate({ to });
          onClick?.();
        }}
      >
        <Box className={[styles.mark, VARIANT_CLASS[variant], SIZE_CLASS[size]].join(" ")}>
          <img src={getLogoSrc(appearance)} alt={alt} className={styles.image} />
        </Box>

        {(title || subtitle) && (
          <Flex direction="column" gap="1" minWidth="0" overflow="hidden">
            {title && (
              <Text as="span" size="3" weight="bold" truncate color="gray" highContrast>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text as="span" size="1" weight="medium" truncate color="gray">
                {subtitle}
              </Text>
            )}
          </Flex>
        )}
      </Button>
    </Flex>
  );
}

export default Logo;

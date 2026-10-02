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

function Logo({ to = ROUTES.HOME, alt = `${APP_NAME} logo`, title, subtitle, variant = "plain", size = "medium", className = "", onClick }: LogoProps) {
  const appearance = useResolvedAppearance();
  const sizeClass =
    size === "small"
      ? styles.sizeSmall
      : size === "large" && variant === "plain"
        ? styles.sizeLargePlain
        : size === "large" && variant === "glassSquare"
          ? styles.sizeLargeGlassSquare
          : size === "large" && variant === "glassCircle"
            ? styles.sizeLargeGlassCircle
            : variant === "glassSquare"
              ? styles.sizeGlassSquare
              : variant === "glassCircle"
                ? styles.sizeGlassCircle
                : styles.sizePlain;
  const logoClasses = [styles.logo, className].filter(Boolean).join(" ");

  return (
    <Flex asChild align="center" gap="3" width="fit-content">
      <Button
        type="button"
        variant="ghost"
        className={logoClasses}
        aria-label={typeof title === "string" ? title : APP_NAME}
        onClick={() => {
          routerEventEmitter.navigate({ to });
          onClick?.();
        }}
      >
        <Box
          className={[
            styles.mark,
            sizeClass,
            variant === "glassCircle" ? styles.radiusFull : variant === "glassSquare" ? styles.radiusIcon : styles.radiusChip,
            variant === "glassCircle" ? styles.edgeCircle : variant === "glassSquare" ? styles.edgeSquare : "",
            variant === "glassCircle" ? styles.fillCircle : variant === "glassSquare" ? styles.fillSquare : "",
            variant === "plain" ? styles.shadowPlain : variant === "glassSquare" ? styles.shadowSquare : styles.shadowCircle,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <img src={getLogoSrc(appearance)} alt={alt} />
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

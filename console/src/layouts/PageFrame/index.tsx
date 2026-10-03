import type { ReactNode } from "react";

import { useRef } from "react";
import { Box, Container, Flex, Section } from "@radix-ui/themes";

import { useReveal } from "@/animations/Reveal";

import styles from "./s.module.css";

/** Wider than Radix Container size="4" (1136px) — fits sidebar layouts without huge side gutters. */
const PAGE_FRAME_DEFAULT_MAX_WIDTH_PX = 1440;

type PageFrameProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: number | string;
  fullHeight?: boolean;
};

function PageFrame({ children, className, maxWidth = PAGE_FRAME_DEFAULT_MAX_WIDTH_PX, fullHeight }: PageFrameProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  useReveal(stackRef);

  const resolvedMaxWidth = typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
  const content = className ? <Box className={className}>{children}</Box> : children;

  const frame = (
    <Container size="4" width="100%" maxWidth={resolvedMaxWidth} px={{ initial: "4", md: "6" }}>
      {fullHeight ? (
        <Flex ref={stackRef} direction="column" width="100%" height="100%">
          {content}
        </Flex>
      ) : (
        <Section size="1" pt="6" pb="9">
          <Flex ref={stackRef} direction="column" gap="5" width="100%" minWidth="0">
            {content}
          </Flex>
        </Section>
      )}
    </Container>
  );

  if (!fullHeight) return frame;

  return (
    <Flex direction="column" flexGrow="1" width="100%" height="100%" minHeight="0" className={styles.fullHeight}>
      {frame}
    </Flex>
  );
}

export default PageFrame;

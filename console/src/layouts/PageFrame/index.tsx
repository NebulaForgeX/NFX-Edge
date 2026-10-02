import type { ReactNode } from "react";

import { Box, Container, Flex, Section } from "@radix-ui/themes";

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
  const resolvedMaxWidth = typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
  const content = className ? <Box className={className}>{children}</Box> : children;

  const frame = (
    <Container size="4" width="100%" maxWidth={resolvedMaxWidth} px="6">
      {fullHeight ? (
        <Flex direction="column" width="100%" height="100%">
          {content}
        </Flex>
      ) : (
        <Section size="1" py="6">
          <Flex direction="column" gap="6" width="100%" minWidth="0">
            {content}
          </Flex>
        </Section>
      )}
    </Container>
  );

  if (!fullHeight) return frame;

  return <Flex direction="column" width="100%" className={styles.fullHeight}>{frame}</Flex>;
}

export default PageFrame;

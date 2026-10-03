import type { ReactNode } from "react";

import { Suspense as ReactSuspense } from "react";
import { Flex, Skeleton, Spinner, Text } from "@radix-ui/themes";

export type SuspenseProps = {
  children: ReactNode;
  loadingText?: string;
};

export default function Suspense({ children, loadingText = "Loading" }: SuspenseProps) {
  return (
    <ReactSuspense
      fallback={
        <Flex direction="column" gap="3" width="100%" aria-busy="true">
          <Flex align="center" gap="2">
            <Spinner />
            <Text size="2" color="gray">
              {loadingText}
            </Text>
          </Flex>
          <Skeleton width="100%" height="var(--space-8)" />
          <Skeleton width="100%" height="var(--space-8)" />
          <Skeleton width="70%" height="var(--space-8)" />
        </Flex>
      }
    >
      {children}
    </ReactSuspense>
  );
}

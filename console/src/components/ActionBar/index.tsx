import type { ReactNode } from "react";

import { Card, Flex } from "@radix-ui/themes";

type ActionBarProps = {
  status?: ReactNode;
  children?: ReactNode;
};

export default function ActionBar({ status, children }: ActionBarProps) {
  return (
    <Card size="2" variant="classic">
      <Flex align="center" justify="between" gap="3" wrap="wrap">
        <Flex align="center" gap="2" minWidth="0">
          {status}
        </Flex>
        <Flex align="center" justify="end" gap="2" wrap="wrap">
          {children}
        </Flex>
      </Flex>
    </Card>
  );
}

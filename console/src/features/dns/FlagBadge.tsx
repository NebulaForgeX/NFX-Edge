import type { BadgeProps } from "@radix-ui/themes";

import { Badge, Text } from "@radix-ui/themes";

import { isNamecheapFlag } from "./flag";

type FlagBadgeProps = {
  value: string | undefined;
  yes: string;
  no: string;
  onColor?: NonNullable<BadgeProps["color"]>;
};

export default function FlagBadge({ value, yes, no, onColor = "green" }: FlagBadgeProps) {
  if (!value) {
    return (
      <Text size="2" color="gray">
        —
      </Text>
    );
  }
  const on = isNamecheapFlag(value);
  return (
    <Badge variant="surface" radius="full" color={on ? onColor : "gray"}>
      {on ? yes : no}
    </Badge>
  );
}

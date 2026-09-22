import { Button, DropdownMenu, Flex, Text } from "@radix-ui/themes";

import type { ControlSize } from "../controlSize";

import styles from "./s.module.css";

export type { ControlSize };

export type DropdownOption = { value: string; label: string };

export type DropdownProps = {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  size?: ControlSize;
};

export default function Dropdown({ options, value, onChange, placeholder, error, disabled, size = "2" }: DropdownProps) {
  const selected = options.find((option) => option.value === value);
  const label = selected?.label || placeholder || "";
  const menuSize = size === "1" ? "1" : "2";

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button type="button" variant="surface" color={error ? "red" : "gray"} size={size} disabled={disabled} className={styles.trigger}>
          <Flex align="center" justify="between" gap="2" width="100%">
            <Text as="span" className={styles.triggerLabel}>
              {label}
            </Text>
            <DropdownMenu.TriggerIcon />
          </Flex>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content size={menuSize} className={styles.menu}>
        <DropdownMenu.RadioGroup value={value || ""} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenu.RadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

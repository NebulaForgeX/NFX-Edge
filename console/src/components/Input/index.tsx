import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { forwardRef } from "react";
import { Flex, Text, TextField } from "@radix-ui/themes";

import type { ControlSize } from "../controlSize";
import styles from "./s.module.css";

type FieldVariant = "surface" | "classic" | "filled";

export type InputProps = Omit<ComponentPropsWithoutRef<"input">, "size" | "color" | "defaultValue" | "value"> & {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  size?: ControlSize;
  variant?: FieldVariant;
  defaultValue?: string | number;
  value?: string | number;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className,
      leftIcon,
      autoComplete = "off",
      id,
      size = "2",
      variant = "surface",
      type,
      ...props
    },
    ref,
  ) => {
    return (
      <Flex direction="column" gap="1" width={fullWidth ? "100%" : undefined} className={className}>
        {label ? (
          <Text as="label" htmlFor={id} className={styles.label}>
            {label}
          </Text>
        ) : null}
        <TextField.Root
          ref={ref}
          id={id}
          size={size}
          variant={variant === "filled" ? "surface" : variant}
          color={error ? "red" : undefined}
          className={fullWidth ? styles.control : styles.compact}
          type={type === "file" ? "text" : (type as "text" | "password" | "email" | "search" | undefined)}
          autoComplete={autoComplete}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="none"
          data-1p-ignore=""
          data-lpignore="true"
          data-form-type="other"
          {...props}
        >
          {leftIcon ? <TextField.Slot>{leftIcon}</TextField.Slot> : null}
        </TextField.Root>
        {error ? (
          <Text className={styles.error}>{error}</Text>
        ) : helperText ? (
          <Text className={styles.helper}>{helperText}</Text>
        ) : null}
      </Flex>
    );
  },
);

Input.displayName = "Input";
export default Input;

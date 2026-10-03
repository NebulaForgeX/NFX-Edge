import { PlusIcon } from "@radix-ui/react-icons";
import { XIcon } from "nfx-ui/icons";
import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo, useEffect, useRef, useState } from "react";
import { Badge, Box, Button, Container, Flex, IconButton, ScrollArea, Section, Text } from "@radix-ui/themes";
import { Controller, useFormContext, type ControllerRenderProps } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";
import styles from "./s.module.css";

interface SANsControllerProps {
  disabled?: boolean;
  readOnly?: boolean;
}

function normalizeApex(apex: string): string {
  return apex.trim().replace(/^\.+/, "").replace(/\.+$/, "").toLowerCase();
}

function prefixFromHost(host: string, apex: string): string {
  const fqdn = host.trim().replace(/\.+$/, "");
  const root = normalizeApex(apex);
  if (!fqdn) return "";
  if (!root) return fqdn;
  const lower = fqdn.toLowerCase();
  if (lower === root) return "@";
  const suffix = `.${root}`;
  if (lower.endsWith(suffix)) return fqdn.slice(0, fqdn.length - suffix.length);
  return fqdn;
}

function fqdnFromPrefix(prefix: string, apex: string): string | null {
  const root = normalizeApex(apex);
  const raw = prefix.trim().replace(/^\.+/, "").replace(/\.+$/, "");
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (!root) return lower.includes(".") ? lower : null;
  if (lower === "@" || lower === root) return null;
  if (lower.includes(".")) return lower;
  const label = prefixFromHost(raw, root);
  if (!label || label === "@") return null;
  const fqdn = `${label}.${root}`;
  if (fqdn === root) return null;
  return fqdn;
}

const SANsController = memo(({ disabled = false, readOnly = false }: SANsControllerProps) => {
  const { t } = useTranslation("certificateElements");
  const { control, watch } = useFormContext<CertificateFormSharedValues>();
  const formValue = watch("sans");
  const apex = watch("domain") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState<string[]>(() => formValue || []);

  useEffect(() => {
    if (formValue) {
      setItems(formValue);
    } else {
      setItems([]);
    }
  }, [formValue]);

  const addPrefix = (value: string, currentItems: string[]): string[] => {
    const fqdn = fqdnFromPrefix(value, apex);
    if (!fqdn) return currentItems;
    if (currentItems.some((item) => item.toLowerCase() === fqdn.toLowerCase())) return currentItems;
    return [...currentItems, fqdn];
  };

  const handleRemoveItem = (index: number, currentItems: string[]): string[] => {
    return currentItems.filter((_, i) => i !== index);
  };

  const commitPrefix = (field: ControllerRenderProps<CertificateFormSharedValues, "sans">) => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;
    const newItems = addPrefix(trimmedValue, items);
    setItems(newItems);
    field.onChange(newItems);
    setInputValue("");
    inputRef.current?.focus();
  };

  const locked = disabled || readOnly;

  return (
    <Flex direction="column" gap="2">
      <Flex align="center" justify="between" gap="2">
        <Text size="1" weight="medium" color="gray">
          {t("form.sans")}
        </Text>
        <Badge size="1" variant="surface" radius="full">
          {items.length}
        </Badge>
      </Flex>
      <Controller
        name="sans"
        control={control}
        render={({ field }) => (
          <Flex direction="column" gap="3">
            <Flex gap="2" align="end" wrap="wrap">
              <Box flexGrow="1" minWidth="12rem">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => {
                    if (!locked) setInputValue(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (locked) return;
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitPrefix(field);
                    }
                  }}
                  placeholder={t("form.sansPlaceholder")}
                  disabled={locked}
                />
              </Box>
              {!locked ? (
                <Button type="button" variant="outline" color="gray" onClick={() => commitPrefix(field)}>
                  <PlusIcon />
                  {t("form.sansAdd")}
                </Button>
              ) : null}
            </Flex>
            <ScrollArea type="auto" scrollbars="vertical" className={styles.items}>
              <Container size="4" px="3">
                <Section size="1" py="3">
                  {items.length > 0 ? (
                    <Flex wrap="wrap" gap="2">
                      {items.map((item, index) => (
                        <Badge key={`${item}-${index}`} size="2" variant="surface" color="gray" highContrast className={styles.chip}>
                          <Text size="1" className={styles.chipText}>
                            {item}
                          </Text>
                          {!locked && (
                            <IconButton
                              type="button"
                              variant="ghost"
                              color="gray"
                              size="1"
                              radius="full"
                              aria-label={t("form.sansRemove")}
                              title={t("form.sansRemove")}
                              onClick={() => {
                                const newItems = handleRemoveItem(index, items);
                                setItems(newItems);
                                field.onChange(newItems);
                              }}
                            >
                              <XIcon size={12} />
                            </IconButton>
                          )}
                        </Badge>
                      ))}
                    </Flex>
                  ) : (
                    <Text as="p" size="2" color="gray" align="center">
                      {readOnly ? t("form.sansReadOnly") : t("form.sansHelp")}
                    </Text>
                  )}
                </Section>
              </Container>
            </ScrollArea>
          </Flex>
        )}
      />
    </Flex>
  );
});

SANsController.displayName = "SANsController";

export default SANsController;

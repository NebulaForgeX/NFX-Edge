import { XIcon } from "nfx-ui/icons";
import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo, useEffect, useRef, useState } from "react";
import { Box, Button, Flex, IconButton } from "@radix-ui/themes";
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
    <Flex direction="column" gap="3">
      <h3 className={styles.sectionTitle}>{t("form.sans")}</h3>
      <Controller
        name="sans"
        control={control}
        render={({ field }) => (
          <Flex direction="column" gap="3">
            <Flex gap="2" align="end" wrap="wrap">
              <Box className={styles.inputWrapper}>
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
                <Button type="button" variant="outline" onClick={() => commitPrefix(field)}>
                  {t("form.sansAdd")}
                </Button>
              ) : null}
            </Flex>
            <div className={styles.itemsWrapper}>
              {items.length > 0 ? (
                <Flex direction="column">
                  {items.map((item, index) => (
                    <Box key={`${item}-${index}`} className={styles.item}>
                      <Box px="3">
                        <Box py="2">
                          <Flex align="center" justify="between" gap="2">
                            <span className={styles.itemText}>{item}</span>
                            {!locked && (
                              <IconButton
                                type="button"
                                variant="ghost"
                                size="1"
                                className={styles.removeButton}
                                onClick={() => {
                                  const newItems = handleRemoveItem(index, items);
                                  setItems(newItems);
                                  field.onChange(newItems);
                                }}
                                title={t("form.sansRemove")}
                              >
                                <XIcon size={14} />
                              </IconButton>
                            )}
                          </Flex>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Flex>
              ) : (
                <Box px="3">
                  <div className={styles.emptyState}>{readOnly ? t("form.sansReadOnly") : t("form.sansHelp")}</div>
                </Box>
              )}
            </div>
          </Flex>
        )}
      />
      <p className={styles.helpText}>{readOnly ? t("form.sansReadOnly") : t("form.sansHelp")}</p>
    </Flex>
  );
});

SANsController.displayName = "SANsController";

export default SANsController;

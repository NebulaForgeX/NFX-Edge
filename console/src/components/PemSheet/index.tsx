import { UploadIcon } from "nfx-ui/icons";
import type { ChangeEvent, DragEvent } from "react";

import { useRef, useState } from "react";
import { Box, Button, Code, Container, Flex, Grid, Section, Text, TextArea } from "@radix-ui/themes";

import styles from "./s.module.css";

export type PemSheetProps = {
  id: string;
  label: string;
  kind: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  accept?: string;
  optional?: boolean;
  optionalLabel?: string;
  error?: string;
  browseLabel: string;
  dropLabel: string;
  rows?: number;
};

function readFile(file: File, onChange: (value: string) => void) {
  const reader = new FileReader();
  reader.onload = (event) => {
    onChange(String(event.target?.result ?? ""));
  };
  reader.readAsText(file);
}

export default function PemSheet({
  id,
  label,
  kind,
  value,
  onChange,
  onBlur,
  placeholder,
  accept = ".crt,.pem,.cert,.key",
  optional = false,
  optionalLabel,
  error,
  browseLabel,
  dropLabel,
  rows = 12,
}: PemSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  const applyFile = (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    readFile(file, onChange);
  };

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    applyFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    applyFile(event.dataTransfer.files?.[0]);
  };

  return (
    <Box
      height="100%"
      minHeight="0"
      className={styles.sheet}
      data-drag={dragging ? "true" : "false"}
      data-invalid={error ? "true" : undefined}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <Box className={`${styles.corner} ${styles.cornerTl}`} />
      <Box className={`${styles.corner} ${styles.cornerTr}`} />
      <Box className={`${styles.corner} ${styles.cornerBl}`} />
      <Box className={`${styles.corner} ${styles.cornerBr}`} />
      <Container width="100%" maxWidth="none" height="100%" minHeight="0" px="4">
        <Section size="1" py="4" height="100%" minHeight="0">
          <Grid rows="auto minmax(10rem, 1fr) auto" gap="3" height="100%" minHeight="0">
            <Flex align="baseline" justify="between" gap="3">
              <Flex align="baseline" gap="2">
                <Text as="label" htmlFor={id} size="1" weight="bold" className={styles.label}>
                  {label}
                </Text>
                {optional ? (
                  <Text size="1" color="gray">
                    {optionalLabel}
                  </Text>
                ) : null}
              </Flex>
              <Code size="1" variant="ghost">
                {kind}
              </Code>
            </Flex>
            <TextArea
              id={id}
              size="2"
              variant="surface"
              rows={rows}
              value={value}
              placeholder={placeholder}
              spellCheck={false}
              className={styles.body}
              onBlur={onBlur}
              onChange={(event) => onChange(event.target.value)}
            />
            <Section size="1" pt="3" pb="0" className={styles.foot}>
              <Flex align="center" gap="3">
                <input ref={inputRef} type="file" accept={accept} className={styles.file} onChange={onFile} />
                <Button type="button" size="1" variant="outline" onClick={() => inputRef.current?.click()}>
                  <UploadIcon size={14} />
                  {browseLabel}
                </Button>
                <Text size="1" color="gray" truncate className={styles.meta}>
                  {fileName || dropLabel}
                </Text>
              </Flex>
            </Section>
          </Grid>
        </Section>
      </Container>
    </Box>
  );
}

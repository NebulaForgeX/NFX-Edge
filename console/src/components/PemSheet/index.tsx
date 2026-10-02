import { UploadIcon } from "nfx-ui/icons";
import type { ChangeEvent, DragEvent } from "react";

import { useRef, useState } from "react";
import { Box, Button, Container, Flex, Grid, Section, Text, TextArea } from "@radix-ui/themes";

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
      <Container width="100%" maxWidth="none" className={styles.sheetInset} >
        <Section className={styles.sheetPad}>
          <Grid className={styles.sheetGrid}>
            <Section className={styles.head}>
              <Flex align="baseline" justify="between" gap="3">
                <Flex align="baseline" className={styles.labelRow}>
                  <Text as="label" htmlFor={id} className={styles.label}>
                    {label}
                  </Text>
                  {optional ? <Text className={styles.optional}>{optionalLabel}</Text> : null}
                </Flex>
                <span className={styles.kind}>{kind}</span>
              </Flex>
            </Section>
            <TextArea
              id={id}
              size="3"
              rows={rows}
              value={value}
              placeholder={placeholder}
              spellCheck={false}
              className={styles.body}
              onBlur={onBlur}
              onChange={(event) => onChange(event.target.value)}
            />
            <Section className={styles.foot}>
              <Flex align="center" gap="3">
                <input ref={inputRef} type="file" accept={accept} className={styles.file} onChange={onFile} />
                <Button type="button" size="1" variant="outline" onClick={() => inputRef.current?.click()}>
                  <UploadIcon size={14} />
                  {browseLabel}
                </Button>
                <Box className={styles.meta}>
                  <span>{fileName || dropLabel}</span>
                </Box>
              </Flex>
            </Section>
          </Grid>
        </Section>
      </Container>
    </Box>
  );
}

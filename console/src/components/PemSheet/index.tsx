import { UploadIcon } from "nfx-ui/icons";
import type { ChangeEvent, DragEvent } from "react";

import { useRef, useState } from "react";
import { Button, Text, TextArea } from "@radix-ui/themes";

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
    <div
      className={`${styles.sheet} ${dragging ? styles.dragging : ""} ${error ? styles.invalid : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <span className={`${styles.corner} ${styles.cornerTl}`} />
      <span className={`${styles.corner} ${styles.cornerTr}`} />
      <span className={`${styles.corner} ${styles.cornerBl}`} />
      <span className={`${styles.corner} ${styles.cornerBr}`} />

      <div className={styles.sheetPx}>
        <div className={styles.sheetPy}>
          <div className={styles.sheetGrid}>
      <div className={styles.head}>
        <Text as="label" htmlFor={id} className={styles.label}>
          {label}
          {optional ? <span className={styles.optional}>{optionalLabel}</span> : null}
        </Text>
        <span className={styles.kind}>{kind}</span>
      </div>

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

      <div className={styles.foot}>
        <input ref={inputRef} type="file" accept={accept} className={styles.file} onChange={onFile} />
        <Button type="button" size="1" variant="outline" onClick={() => inputRef.current?.click()}>
          <UploadIcon size={14} />
          {browseLabel}
        </Button>
        <span className={styles.meta}>{fileName || dropLabel}</span>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}

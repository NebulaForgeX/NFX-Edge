import { AnimatedIcon, type AnimatedIconComponent, CheckedIcon, CopyIcon } from "nfx-ui/icons";
import { memo, useEffect, useState } from "react";
import { Button, Card, Container, Flex, ScrollArea, Section, Text } from "@radix-ui/themes";

import styles from "./s.module.css";

interface PemBlockProps {
  icon: AnimatedIconComponent;
  label: string;
  copyLabel: string;
  value: string;
  muted?: boolean;
  onCopy: () => void;
}

const COPIED_RESET_MS = 1600;

const PemBlock = memo(({ icon, label, copyLabel, value, muted = false, onCopy }: PemBlockProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Card size="2" variant="surface">
      <Flex direction="column" gap="3" height="100%">
        <Flex align="center" justify="between" gap="3">
          <Flex align="center" gap="2" minWidth="0">
            <Flex align="center" justify="center" flexShrink="0" className={styles.stamp}>
              <AnimatedIcon icon={icon} size={14} />
            </Flex>
            <Text size="1" weight="bold" truncate className={styles.kind}>
              {label}
            </Text>
          </Flex>
          <Button
            size="1"
            variant="outline"
            color={copied ? "green" : "gray"}
            onClick={() => {
              onCopy();
              setCopied(true);
            }}
          >
            {copied ? <CheckedIcon size={14} /> : <CopyIcon size={14} />}
            {copyLabel}
          </Button>
        </Flex>
        <ScrollArea type="auto" scrollbars="vertical" className={styles.scroll}>
          <Container size="4" px="3">
            <Section size="1" py="3">
              <pre className={styles.pem} data-muted={muted ? "true" : "false"}>
                {value}
              </pre>
            </Section>
          </Container>
        </ScrollArea>
      </Flex>
    </Card>
  );
});

PemBlock.displayName = "PemBlock";

export default PemBlock;

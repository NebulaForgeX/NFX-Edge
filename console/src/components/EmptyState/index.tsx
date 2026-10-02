import type { ReactNode } from "react";

import { Box, Container, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { AnimatedIcon, type AnimatedIconComponent } from "nfx-ui/icons";

import styles from "./s.module.css";

export type EmptyStateProps = {
  icon?: AnimatedIconComponent;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <Box className={styles.frame}>
      <Container size="1" px="5">
        <Section size="1" py="8">
          <Flex direction="column" align="center" justify="center" gap="3">
            {icon ? (
              <Flex align="center" justify="center" className={styles.stamp}>
                <AnimatedIcon icon={icon} size={20} />
              </Flex>
            ) : null}
            <Heading as="h3" size="4" align="center" className={styles.title}>
              {title}
            </Heading>
            {description ? (
              <Text as="p" size="2" color="gray" align="center" className={styles.lede}>
                {description}
              </Text>
            ) : null}
            {action}
          </Flex>
        </Section>
      </Container>
    </Box>
  );
};

export default EmptyState;

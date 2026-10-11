import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Box, Flex, Grid, Section, Text } from "@radix-ui/themes";
import gsap from "gsap";

import { ProgressStepStateEnum } from "@/enums";

import styles from "./s.module.css";

gsap.registerPlugin(useGSAP);

export type IssueStep = {
  n: string;
  label: string;
  hint: string;
  state: ProgressStepStateEnum;
};

const FILL: Record<ProgressStepStateEnum, number> = {
  [ProgressStepStateEnum.DONE]: 1,
  [ProgressStepStateEnum.ACTIVE]: 0.35,
  [ProgressStepStateEnum.PENDING]: 0,
};

/** Horizontal issue stepper; each bar fills as the form completes its step. */
export default function IssueStepper({ steps, ariaLabel }: { steps: IssueStep[]; ariaLabel: string }) {
  const rootRef = useRef<HTMLOListElement>(null);
  const signature = steps.map((step) => step.state).join("|");

  useGSAP(
    () => {
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.5;
      gsap.utils.toArray<HTMLElement>(".js-step-fill").forEach((node, index) => {
        gsap.to(node, { scaleX: FILL[steps[index].state], duration, ease: "power3.out" });
      });
    },
    { scope: rootRef, dependencies: [signature], revertOnUpdate: false },
  );

  return (
    <Grid asChild columns="3" gap="3" width="100%">
      <ol ref={rootRef} aria-label={ariaLabel} className={styles.steps}>
        {steps.map((step) => (
          <li key={step.n} data-state={step.state} aria-current={step.state === ProgressStepStateEnum.ACTIVE ? "step" : undefined} className={styles.step}>
            <Box className={styles.bar}>
              <Box className={`${styles.fill} js-step-fill`} />
            </Box>
            <Section size="1" pt="2" pb="0">
              <Flex direction="column" gap="0" minWidth="0">
                <Flex align="baseline" gap="2" minWidth="0">
                  <Text as="span" className={styles.num}>
                    {step.n}
                  </Text>
                  <Text as="span" size="2" weight="bold" truncate className={styles.label}>
                    {step.label}
                  </Text>
                </Flex>
                <Text as="span" size="1" color="gray" truncate>
                  {step.hint}
                </Text>
              </Flex>
            </Section>
          </li>
        ))}
      </ol>
    </Grid>
  );
}

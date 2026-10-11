/**
 * Progress step state — signup stepper and panel rows.
 */
import type { Nilable } from "nfx-ui/types";

import { safeEnum } from "nfx-ui/utils";

export enum ProgressStepStateEnum {
  DONE = "done",
  ACTIVE = "active",
  PENDING = "pending",
}

export const DEFAULT_PROGRESS_STEP_STATE = ProgressStepStateEnum.PENDING;
export const PROGRESS_STEP_STATE_VALUES = Object.values(ProgressStepStateEnum);
export const ProgressStepState = (value: Nilable<string>) =>
  safeEnum(value, PROGRESS_STEP_STATE_VALUES, DEFAULT_PROGRESS_STEP_STATE);

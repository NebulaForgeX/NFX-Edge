/**
 * Login channel — which identifier the unlock form collects.
 */
import type { Nilable } from "nfx-ui/types";

import { safeEnum } from "nfx-ui/utils";

export enum LoginChannelEnum {
  EMAIL = "email",
  PHONE = "phone",
}

export const DEFAULT_LOGIN_CHANNEL = LoginChannelEnum.EMAIL;
export const LOGIN_CHANNEL_VALUES = Object.values(LoginChannelEnum);
export const LoginChannel = (value: Nilable<string>) =>
  safeEnum(value, LOGIN_CHANNEL_VALUES, DEFAULT_LOGIN_CHANNEL);

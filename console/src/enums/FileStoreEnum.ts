/**
 * File store — backend json store.
 */
import type { Nilable } from "nfx-ui/types";

import { safeEnum } from "nfx-ui/utils";

export enum FileStoreEnum {
  WEBSITES = "websites",
}

export const DEFAULT_FILE_STORE = FileStoreEnum.WEBSITES;
export const FILE_STORE_VALUES = Object.values(FileStoreEnum);
export const FileStore = (value: Nilable<string>) =>
  safeEnum(value, FILE_STORE_VALUES, DEFAULT_FILE_STORE);

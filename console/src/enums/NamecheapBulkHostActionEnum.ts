/**
 * Bulk host collection — update, add (skip if present), or delete matching records.
 */
import type { Nilable } from "nfx-ui/types";

import { safeEnum } from "nfx-ui/utils";

export enum NamecheapBulkHostActionEnum {
  UPDATE = "update",
  ADD = "add",
  DELETE = "delete",
}

export const DEFAULT_NAMECHEAP_BULK_HOST_ACTION = NamecheapBulkHostActionEnum.UPDATE;
export const NAMECHEAP_BULK_HOST_ACTION_VALUES = Object.values(NamecheapBulkHostActionEnum);
export const NamecheapBulkHostAction = (value: Nilable<string>) =>
  safeEnum(value, NAMECHEAP_BULK_HOST_ACTION_VALUES, DEFAULT_NAMECHEAP_BULK_HOST_ACTION);

export enum NamecheapBulkHostStatusEnum {
  UPDATED = "updated",
  ADDED = "added",
  DELETED = "deleted",
  SKIPPED = "skipped",
  FAILED = "failed",
}

export const DEFAULT_NAMECHEAP_BULK_HOST_STATUS = NamecheapBulkHostStatusEnum.SKIPPED;
export const NAMECHEAP_BULK_HOST_STATUS_VALUES = Object.values(NamecheapBulkHostStatusEnum);
export const NamecheapBulkHostStatus = (value: Nilable<string>) =>
  safeEnum(value, NAMECHEAP_BULK_HOST_STATUS_VALUES, DEFAULT_NAMECHEAP_BULK_HOST_STATUS);

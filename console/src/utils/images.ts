import type { Nilable } from "nfx-ui/types";

import { API_ENDPOINTS, URL_PATHS } from "nfx-ui/apis";

export const DEFAULT_AVATAR_SRC = "/default-avatar.png";

export const buildImageUrl = (imageId: Nilable<string>): string => {
  if (!imageId) return "";
  if (imageId.startsWith("http://") || imageId.startsWith("https://")) {
    return imageId;
  }
  return `${API_ENDPOINTS.IDENTITY}${URL_PATHS.ASSET.Images.fileById(imageId)}`;
};

export function buildAvatarImageSrc(avatarImageId: Nilable<string>): string {
  return avatarImageId ? buildImageUrl(avatarImageId) : DEFAULT_AVATAR_SRC;
}

export const resolveAvatarSrc = (imageId: Nilable<string>): string => buildImageUrl(imageId) || DEFAULT_AVATAR_SRC;

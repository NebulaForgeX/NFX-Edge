import type { BadgeProps } from "@radix-ui/themes";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { CertificateInfo } from "@/types";

export interface CertificateTimeInfo {
  label: string;
  color: NonNullable<BadgeProps["color"]>;
}

export const useCertificateTime = (cert: CertificateInfo | undefined): CertificateTimeInfo => {
  const { t } = useTranslation("certCheck");

  return useMemo(() => {
    if (!cert) {
      return { label: t("status.valid"), color: "gray" };
    }

    const isExpired = !cert.isValid || (cert.daysRemaining !== undefined && cert.daysRemaining <= 0);
    if (isExpired) {
      return { label: t("status.expired"), color: "red" };
    }

    if (cert.daysRemaining !== undefined) {
      const days = cert.daysRemaining;
      if (days < 7) {
        return { label: `${t("status.expiringSoon")} · ${t("status.remainingDays", { days })}`, color: "amber" };
      }
      return { label: t("status.remainingDays", { days }), color: days <= 30 ? "amber" : "green" };
    }

    return { label: t("status.valid"), color: "green" };
  }, [cert, t]);
};

export const useCertificateCountdown = (notAfter?: string): { countdown: string; isExpired: boolean } => {
  const [countdown, setCountdown] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!notAfter) {
      setCountdown("");
      setIsExpired(false);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(notAfter).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setCountdown("00:00:00:00");
        setIsExpired(true);
        return;
      }

      setIsExpired(false);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formatTime = (value: number) => value.toString().padStart(2, "0");
      setCountdown(`${formatTime(days)}:${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [notAfter]);

  return { countdown, isExpired };
};

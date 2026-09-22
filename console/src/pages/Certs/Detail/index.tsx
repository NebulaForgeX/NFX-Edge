import { ArrowNarrowLeftIcon, ClockIcon, LockIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Badge, Button, Flex } from "@radix-ui/themes";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { safeStringable } from "nfx-ui/utils";

import { EmptyState, PageHeader, Suspense } from "@/components";
import { routerEventEmitter } from "@/events/router";
import { useCertificateCountdown, useCertificateDetailById, useCertificateTime } from "@/hooks";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";
import { showSuccess } from "@/stores/modal";
import { buildCertCheckPath } from "@/utils/certCheckUrl";

import CertificateContent from "./CertificateContent";
import CertificateInfo from "./CertificateInfo";
import CertificateOperations from "./CertificateOperations";
import CertificateSansSection from "./CertificateSansSection";
import ExportCertificate from "./ExportCertificate";
import PrivateKeyContent from "./PrivateKeyContent";
import SansChangedBanner from "./SansChangedBanner";
import styles from "./s.module.css";

const CertDetailContent = memo(() => {
  const { t } = useTranslation("certDetail");
  const { certificateId } = useParams<{ certificateId: string }>();
  const { data: certDetail } = useCertificateDetailById(safeStringable(certificateId));
  const timeInfo = useCertificateTime(certDetail);
  const { countdown, isExpired } = useCertificateCountdown(certDetail.notAfter);

  const handleCopyCertificate = () => {
    navigator.clipboard.writeText(certDetail.certificate);
    showSuccess(t("copy.success") || "Certificate copied to clipboard");
  };

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(certDetail.privateKey);
    showSuccess(t("copy.success") || "Private key copied to clipboard");
  };

  return (
    <PageFrame>
      <PageHeader
        icon={LockIcon}
        index={t("index")}
        title={certDetail.domain}
        description={countdown}
        actions={
          <Flex gap="2" align="center" wrap="wrap">
            <Badge>{timeInfo.label}</Badge>
            {certDetail.notAfter && countdown ? (
              <Badge color={isExpired ? "red" : "blue"}>
                <ClockIcon size={12} /> {countdown}
              </Badge>
            ) : null}
            <Button variant="ghost" onClick={() => routerEventEmitter.navigate({ to: buildCertCheckPath() })}>
              <ArrowNarrowLeftIcon size={16} />
              {t("back") || "Back"}
            </Button>
          </Flex>
        }
      />
      <SansChangedBanner visible={Boolean(certDetail.sansChanged)} />
      <CertificateInfo certDetail={certDetail} />
      <CertificateSansSection sans={certDetail.sans} />
      <div className={styles.pemPair}>
        <CertificateContent certificate={certDetail.certificate} onCopy={handleCopyCertificate} />
        <PrivateKeyContent privateKey={certDetail.privateKey} onCopy={handleCopyPrivateKey} />
      </div>
      <ExportCertificate
        certificate={certDetail.certificate}
        privateKey={certDetail.privateKey}
        domain={certDetail.domain}
        certificateId={certDetail.id}
      />
      <CertificateOperations certificateId={certDetail.id} />
    </PageFrame>
  );
});
CertDetailContent.displayName = "CertDetailContent";

const CertDetailPage = memo(() => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { t } = useTranslation("certDetail");

  if (!certificateId) {
    return (
      <PageFrame>
        <EmptyState
          icon={LockIcon}
          title={t("error.loadFailed") || "Invalid certificate parameters"}
          action={
            <Button onClick={() => routerEventEmitter.navigate({ to: ROUTES.CERTS_OVERVIEW })}>
              {t("back") || "Back to Certificate List"}
            </Button>
          }
        />
      </PageFrame>
    );
  }

  return (
    <Suspense loadingText={t("loading") || "Loading certificate..."}>
      <CertDetailContent />
    </Suspense>
  );
});

CertDetailPage.displayName = "CertDetailPage";
export default CertDetailPage;

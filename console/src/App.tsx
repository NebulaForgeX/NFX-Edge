import { GuestRoute, ProtectedRoute } from "nfx-ui/navigations";
import { Navigate, Route, Routes } from "react-router";

import { Sidebar } from "@/layouts";
import { ROUTES } from "@/navigations";
import {
  CertAddPage,
  CertsOverviewPage,
  CertDetailPage,
  CertEditPage,
  DashboardPage,
  FileFolderPage,
  NamecheapDetailPage,
  NamecheapDomainDetailPage,
  NamecheapDomainsBulkPage,
  NamecheapDomainsPage,
  NamecheapEditPage,
  NamecheapNewPage,
  NamecheapOverviewPage,
  NamecheapSslPage,
  LoginPage,
  NotFoundPage,
  ProfileEditPage,
  ProfileIdentitiesPage,
  ProfileOverviewPage,
  SettingsPage,
  SignupPage,
  TLSAnalysisPage,
} from "@/pages";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute redirectTo={ROUTES.CERTS_OVERVIEW} />}>
        <Route index element={<LoginPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
      </Route>

      <Route element={<ProtectedRoute redirectTo={ROUTES.LOGIN} />}>
        <Route element={<Sidebar />}>
          <Route path={ROUTES.USER} element={<Navigate to={ROUTES.CERTS_OVERVIEW} replace />} />
          <Route path={ROUTES.USER_OVERVIEW} element={<DashboardPage />} />
          <Route path={ROUTES.CERTS} element={<Navigate to={ROUTES.CERTS_OVERVIEW} replace />} />
          <Route path={ROUTES.CERTS_OVERVIEW} element={<CertsOverviewPage />} />
          <Route path={ROUTES.CERT_ADD} element={<CertAddPage />} />
          <Route path={ROUTES.CERT_EDIT} element={<CertEditPage />} />
          <Route path={ROUTES.CERT_DETAIL} element={<CertDetailPage />} />
          <Route path={ROUTES.ANALYSIS_TLS} element={<TLSAnalysisPage />} />
          <Route path={ROUTES.FILE_FOLDER} element={<FileFolderPage />} />
          <Route path={ROUTES.NAMECHEAP} element={<Navigate to={ROUTES.NAMECHEAP_OVERVIEW} replace />} />
          <Route path={ROUTES.NAMECHEAP_OVERVIEW} element={<NamecheapOverviewPage />} />
          <Route path={ROUTES.NAMECHEAP_NEW} element={<NamecheapNewPage />} />
          <Route path={ROUTES.NAMECHEAP_EDIT} element={<NamecheapEditPage />} />
          <Route path={ROUTES.NAMECHEAP_SSL} element={<NamecheapSslPage />} />
          <Route path={ROUTES.NAMECHEAP_DOMAINS_BULK} element={<NamecheapDomainsBulkPage />} />
          <Route path={ROUTES.NAMECHEAP_DOMAIN} element={<NamecheapDomainDetailPage />} />
          <Route path={ROUTES.NAMECHEAP_DOMAINS} element={<NamecheapDomainsPage />} />
          <Route path={ROUTES.NAMECHEAP_DETAIL} element={<NamecheapDetailPage />} />
          <Route path={ROUTES.PROFILE} element={<Navigate to={ROUTES.USER_PROFILE_OVERVIEW} replace />} />
          <Route path={ROUTES.USER_PROFILE_OVERVIEW} element={<ProfileOverviewPage />} />
          <Route path={ROUTES.USER_PROFILE_EDIT} element={<ProfileEditPage />} />
          <Route path={ROUTES.USER_PROFILE_IDENTITIES} element={<ProfileIdentitiesPage />} />
          <Route path={ROUTES.USER_SETTINGS} element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

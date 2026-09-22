import type { CertificateFormValues } from "../schemas/certificateSchema";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { createManualCertificateFormSchema } from "../schemas/certificateSchema";
import { folderNameFromDomain } from "../utils/folderNameFromDomain";
import { DEFAULT_CERTIFICATE_ISSUER } from "@/enums";

export default function useInitManualCertificateForm() {
  const { t } = useTranslation("common");
  const [searchParams] = useSearchParams();
  const schema = createManualCertificateFormSchema(t);
  const domain = (searchParams.get("domain") ?? "").trim();

  return useForm<CertificateFormValues>({
    resolver: zodResolver(schema) as Resolver<CertificateFormValues>,
    mode: "onChange",
    defaultValues: {
      domain,
      folderName: folderNameFromDomain(domain),
      email: "",
      issuer: DEFAULT_CERTIFICATE_ISSUER,
      certificate: "",
      privateKey: "",
      sans: [],
      webroot: "",
      forceRenewal: false,
    },
  });
}

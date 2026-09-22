import type { EdgeRepositories } from "./types";

import { ApiAnalysisRepository } from "./AnalysisRepository";
import { ApiDnsRepository } from "./DnsRepository";
import { ApiFileRepository } from "./FileRepository";
import { ApiTlsRepository } from "./TlsRepository";

export const edgeRepositories: EdgeRepositories = {
  tls: new ApiTlsRepository(),
  file: new ApiFileRepository(),
  analysis: new ApiAnalysisRepository(),
  dns: new ApiDnsRepository(),
};

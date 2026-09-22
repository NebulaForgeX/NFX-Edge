import type { AnalysisRepository } from "./AnalysisRepository";
import type { DnsRepository } from "./DnsRepository";
import type { FileRepository } from "./FileRepository";
import type { TlsRepository } from "./TlsRepository";

export interface EdgeRepositories {
  tls: TlsRepository;
  file: FileRepository;
  analysis: AnalysisRepository;
  dns: DnsRepository;
}

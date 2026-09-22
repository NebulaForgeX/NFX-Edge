import type { AnalyzeTLSRequest } from "@/types";
import type { AnalyzeTLSResponse } from "@/types";
import { protectedClient, publicClientWithoutTransform } from "@/apis/clients";
import { URL_PATHS } from "./ip";

interface Envelope<T> {
  status: number;
  message: string;
  data: T;
}

async function unwrap<T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> {
  const { data } = await promise;
  return data.data;
}

export const AnalyzeTLS = (params: AnalyzeTLSRequest): Promise<AnalyzeTLSResponse> =>
  unwrap<AnalyzeTLSResponse>(protectedClient.post(URL_PATHS.ANALYSIS.tls, params));

export const GetErrorTranslations = async (lang: string): Promise<Record<string, unknown>> => {
  const { data } = await publicClientWithoutTransform.get<Record<string, unknown>>(URL_PATHS.ANALYSIS.locales(lang));
  return data;
};

export const GetMessageTranslations = async (lang: string): Promise<Record<string, unknown>> => {
  const { data } = await publicClientWithoutTransform.get<Record<string, unknown>>(URL_PATHS.ANALYSIS.messages(lang));
  return data;
};

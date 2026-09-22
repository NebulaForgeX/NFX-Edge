import { useListEmails } from "nfx-ui/hooks";
import { safeArray } from "nfx-ui/utils";

export default function useLoginEmail(): string {
  const emails = useListEmails();
  const items = safeArray(emails.data?.items);
  return items.find((item) => item.isPrimary)?.email ?? items[0]?.email ?? "";
}

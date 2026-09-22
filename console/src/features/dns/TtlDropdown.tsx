import { Dropdown } from "@/components";
import type { ControlSize } from "@/components/controlSize";
import { namecheapTtlOptions, namecheapTtlSelectValue } from "./ttl";

type TtlDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  automaticLabel: string;
  unsetValue?: string;
  unsetLabel?: string;
  size?: ControlSize;
};

export default function TtlDropdown({ value, onChange, automaticLabel, unsetValue, unsetLabel, size = "2" }: TtlDropdownProps) {
  const options = [
    ...(unsetValue && unsetLabel ? [{ value: unsetValue, label: unsetLabel }] : []),
    ...namecheapTtlOptions(automaticLabel, unsetValue && value === unsetValue ? undefined : value),
  ];
  const selected = unsetValue && (value === unsetValue || value === "") ? unsetValue : namecheapTtlSelectValue(value);
  return <Dropdown size={size} options={options} value={selected} onChange={onChange} />;
}

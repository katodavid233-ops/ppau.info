import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  DEFAULT_DIAL_CODE,
  formatPhoneNumber,
  getCountryByName,
  parsePhoneNumber,
} from "@/lib/data/countries";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Sync dial code when nationality changes */
  nationality?: string;
  placeholder?: string;
};

function isoForDial(dialCode: string, nationality?: string): string {
  if (nationality) {
    const c = getCountryByName(nationality);
    if (c?.dialCode === dialCode) return c.iso2;
  }
  const match = COUNTRIES.find((c) => c.dialCode === dialCode);
  return match?.iso2 ?? "UG";
}

export function PhoneInput({
  value,
  onChange,
  nationality,
  placeholder = "701 234 567",
}: Props) {
  const parsed = parsePhoneNumber(value);
  const [iso2, setIso2] = useState(() => isoForDial(parsed.dialCode, nationality));
  const [local, setLocal] = useState(parsed.local);

  const dialCode = COUNTRIES.find((c) => c.iso2 === iso2)?.dialCode ?? DEFAULT_DIAL_CODE;

  useEffect(() => {
    const next = parsePhoneNumber(value);
    setIso2(isoForDial(next.dialCode, nationality));
    setLocal(next.local);
  }, [value, nationality]);

  useEffect(() => {
    if (!nationality) return;
    const country = getCountryByName(nationality);
    if (country && country.iso2 !== iso2) {
      setIso2(country.iso2);
      onChange(formatPhoneNumber(country.dialCode, local));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when nationality changes
  }, [nationality]);

  function update(countryIso: string, localNum: string) {
    const country = COUNTRIES.find((c) => c.iso2 === countryIso) ?? getCountryByName(DEFAULT_COUNTRY)!;
    setIso2(countryIso);
    setLocal(localNum);
    onChange(formatPhoneNumber(country.dialCode, localNum));
  }

  return (
    <div className="flex gap-2">
      <Select value={iso2} onValueChange={(code) => update(code, local)}>
        <SelectTrigger className="w-[160px] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {COUNTRIES.map((c) => (
            <SelectItem key={c.iso2} value={c.iso2}>
              {c.iso2} {c.dialCode}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className="flex-1"
        placeholder={dialCode === DEFAULT_DIAL_CODE ? placeholder : "Phone number"}
        value={local}
        onChange={(e) => update(iso2, e.target.value)}
      />
    </div>
  );
}

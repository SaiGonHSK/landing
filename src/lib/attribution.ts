
export type LeadSource = "landing" | "facebook" | "zalo";

const KEY = "saigonhsk:lead-source";

const UTM: Record<string, LeadSource> = {
  facebook: "facebook",
  fb: "facebook",
  "facebook-ads": "facebook",
  fbads: "facebook",
  meta: "facebook",
  messenger: "facebook",
  ig: "facebook",
  instagram: "facebook",
  zalo: "zalo",
  "zalo-ads": "zalo",
  zns: "zalo",
};

const HOSTS: [RegExp, LeadSource][] = [
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|fb\.watch|messenger\.com|instagram\.com)$/, "facebook"],
  [/(^|\.)zalo\.me$/, "zalo"],
];

const isSource = (value: string): value is LeadSource =>
  value === "landing" || value === "facebook" || value === "zalo";

function read(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function write(source: LeadSource): void {
  try {
    window.sessionStorage.setItem(KEY, source);
  } catch {
  }
}

function fromReferrer(referrer: string): LeadSource | null {
  if (!referrer) return null;

  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }

  if (host === window.location.hostname.toLowerCase().replace(/^www\./, "")) {
    return null;
  }

  return HOSTS.find(([pattern]) => pattern.test(host))?.[1] ?? null;
}

function detect(): LeadSource | null {
  const params = new URLSearchParams(window.location.search);

  const utm = (params.get("utm_source") ?? "").trim().toLowerCase();
  if (utm && UTM[utm]) return UTM[utm];

  if (params.get("fbclid")) return "facebook";

  return fromReferrer(document.referrer);
}

export function captureAttribution(): void {
  const found = detect();
  if (found) write(found);
}

export function leadSource(): LeadSource {
  const stored = read();
  return stored && isSource(stored) ? stored : "landing";
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  landing: "Website",
  facebook: "Facebook",
  zalo: "Zalo",
};

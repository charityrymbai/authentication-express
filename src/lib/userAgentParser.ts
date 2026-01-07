import { UAParser } from "ua-parser-js";

export function parseDevice(userAgent?: string): string {
  if (!userAgent) return "Unknown device";

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const browser = result.browser.name ?? "Unknown Browser";
  const os = result.os.name ?? "Unknown OS";

  return `${browser} on ${os}`;
}

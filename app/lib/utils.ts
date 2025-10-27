/**
 * =========================
 * Address & EVM helpers
 * =========================
 */

/** Validate Ethereum address (0x + 40 hex chars) */
export function isValidAddress(address: string = ""): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Shorten address: 0x1234…abcd
 * Backwards-compatible with your previous version (no second/third args required).
 */
export function formatAddress(address: string = "", left: number = 6, right: number = 4): string {
  const a = address?.trim() ?? "";
  if (!a) return "";
  // If already short, return as-is
  if (a.length <= left + right + 3) return a;
  // Use the three-dot ellipsis to match your original style
  return `${a.slice(0, left)}...${a.slice(-right)}`;
}

/** Hex -> number (safe) */
export const hexToNum = (hex?: string | null) => {
  if (!hex || typeof hex !== "string") return null;
  try { return parseInt(hex, 16); } catch { return null; }
};
/** number -> hex (0x…) */
export const numToHex = (n: number) => `0x${n.toString(16)}`;


/**
 * =========================
 * Numbers / Currency / Percent
 * =========================
 */

/** Format number with specified decimals (defaults to 2) */
export function formatNumber(num: number | string, decimals: number = 2): string {
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "0";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format as USD currency.
 * - Backwards-compatible default of 2 decimals.
 * - If you pass a custom decimals value, it will honor it.
 */
export function formatUSD(num: number | string, decimals: number = 2): string {
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "$0.00";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format percentage with sign (e.g., +1.23%) */
export function formatPercent(num: number | string, decimals: number = 2): string {
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "0%";
  const formatted = Math.abs(n).toFixed(decimals);
  const sign = n >= 0 ? "+" : "-";
  return `${sign}${formatted}%`;
}


/**
 * =========================
 * Dates
 * =========================
 */

export function formatDate(timestampSec: number): string {
  return new Date(timestampSec * 1000).toLocaleDateString();
}

export function formatDateTime(timestampSec: number): string {
  return new Date(timestampSec * 1000).toLocaleString();
}


/**
 * =========================
 * Portfolio helpers (positions / PnL)
 * =========================
 */

/** Get position side label */
export function getPositionSide(size: number): "LONG" | "SHORT" {
  return size > 0 ? "LONG" : "SHORT";
}

/** Get position side color */
export function getPositionColor(size: number): string {
  return size > 0 ? "text-success-600" : "text-danger-600";
}

/** Get PnL color class */
export function getPnLColor(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "text-gray-600";
  return n >= 0 ? "text-success-600" : "text-danger-600";
}

/** Calculate 24h change percentage */
export function calculate24hChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}


/**
 * =========================
 * Clipboard
 * =========================
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
}


/**
 * =========================
 * App-specific helpers
 * =========================
 */

/** Keep only balances that are actually non-zero. */
export function filterNonZeroBalances<T extends { total?: number; hold?: number }>(balances: T[] = []) {
  return balances.filter((b) => {
    const t = typeof b.total === "number" ? b.total : 0;
    const h = typeof b.hold === "number" ? b.hold : 0;
    return t !== 0 || h !== 0;
  });
}

/** Robust pair-name fallback for spot page. */
export function getPairName(asset: any, idx: number) {
  if (asset?.symbol) return asset.symbol;
  if (asset?.name) return asset.name;
  if (Array.isArray(asset?.tokens) && asset.tokens.length >= 2) return `${asset.tokens[0]}/${asset.tokens[1]}`;
  if (asset?.token0Symbol && asset?.token1Symbol) return `${asset.token0Symbol}/${asset.token1Symbol}`;
  return `@${idx}`;
}

/** Robust decimals fallback. */
export function getSizeDecimals(asset: any) {
  if (asset?.szDecimals != null) return asset.szDecimals;
  if (asset?.sizeDecimals != null) return asset.sizeDecimals;
  if (asset?.qtyDecimals != null) return asset.qtyDecimals;
  if (asset?.decimals?.size != null) return asset.decimals.size;
  return "N/A";
}

/**
 * Feature flags.
 *
 * Every user-facing feature that is not ready for everyone ships behind a
 * flag registered here with its default. Defaults are `false` until the
 * feature is released; delete the flag (and the branches it guards) when
 * the feature ships.
 *
 * Local overrides, in order of precedence:
 *   1. URL query  `?ff=flag_a,flag_b`   (also persisted to localStorage)
 *   2. localStorage key `repstack:feature-flags` (JSON object)
 *   3. the defaults below
 */

export const FEATURE_FLAG_DEFAULTS = {
  // flag_name: false,
} as const satisfies Record<string, boolean>;

export type FeatureFlag = keyof typeof FEATURE_FLAG_DEFAULTS;

const STORAGE_KEY = 'repstack:feature-flags';

type FlagOverrides = Partial<Record<string, boolean>>;

/**
 * Pure resolution: defaults, then stored overrides, then URL overrides.
 * Unknown flags are ignored so a stale localStorage entry cannot enable
 * something that no longer exists.
 */
export function resolveFlags<T extends Record<string, boolean>>(
  defaults: T,
  stored: FlagOverrides = {},
  fromUrl: string[] = []
): Record<keyof T, boolean> {
  const result = { ...defaults } as Record<keyof T, boolean>;
  for (const name of Object.keys(defaults) as (keyof T)[]) {
    const key = name as string;
    if (typeof stored[key] === 'boolean') result[name] = stored[key]!;
    if (fromUrl.includes(key)) result[name] = true;
  }
  return result;
}

export function parseFlagQuery(search: string): string[] {
  const value = new URLSearchParams(search).get('ff');
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function readStored(): FlagOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as FlagOverrides)
      : {};
  } catch {
    return {};
  }
}

function persistUrlFlags(names: string[]): void {
  if (names.length === 0) return;
  try {
    const next = { ...readStored() };
    for (const name of names) next[name] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable (private mode); URL override still applies
  }
}

let cache: Record<string, boolean> | null = null;

/** Clears the resolved cache. Only needed in tests. */
export function resetFeatureFlagCache(): void {
  cache = null;
}

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  if (!cache) {
    const fromUrl =
      typeof window !== 'undefined'
        ? parseFlagQuery(window.location.search)
        : [];
    persistUrlFlags(fromUrl);
    cache = resolveFlags(FEATURE_FLAG_DEFAULTS, readStored(), fromUrl);
  }
  return cache[flag as string] ?? false;
}

/**
 * Unit tests for feature flag resolution
 */

import { describe, it, expect } from 'vitest';
import { resolveFlags, parseFlagQuery } from './featureFlags';

const defaults = { alpha: false, beta: true } as const;

describe('resolveFlags', () => {
  it('returns the defaults when nothing overrides them', () => {
    expect(resolveFlags(defaults)).toEqual({ alpha: false, beta: true });
  });

  it('applies stored overrides', () => {
    expect(resolveFlags(defaults, { alpha: true, beta: false })).toEqual({
      alpha: true,
      beta: false,
    });
  });

  it('lets the URL win over stored values', () => {
    expect(resolveFlags(defaults, { alpha: false }, ['alpha'])).toEqual({
      alpha: true,
      beta: true,
    });
  });

  it('ignores flags that are not registered', () => {
    const result = resolveFlags(defaults, { ghost: true }, ['phantom']);
    expect(result).toEqual({ alpha: false, beta: true });
    expect('ghost' in result).toBe(false);
  });
});

describe('parseFlagQuery', () => {
  it('parses a comma-separated ff parameter', () => {
    expect(parseFlagQuery('?ff=alpha,beta')).toEqual(['alpha', 'beta']);
  });

  it('trims whitespace and drops empty entries', () => {
    expect(parseFlagQuery('?ff=alpha, ,beta,')).toEqual(['alpha', 'beta']);
  });

  it('returns an empty list without the parameter', () => {
    expect(parseFlagQuery('?other=1')).toEqual([]);
    expect(parseFlagQuery('')).toEqual([]);
  });
});

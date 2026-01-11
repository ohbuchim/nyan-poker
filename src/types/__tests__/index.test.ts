import { describe, it, expect } from 'vitest';
import * as typeExports from '../index';

describe('types/index exports', () => {
  it('should export COLOR_NAMES', () => {
    expect(typeExports.COLOR_NAMES).toBeDefined();
    expect(Object.keys(typeExports.COLOR_NAMES)).toHaveLength(12);
  });

  it('should export FUR_NAMES', () => {
    expect(typeExports.FUR_NAMES).toBeDefined();
    expect(Object.keys(typeExports.FUR_NAMES)).toHaveLength(2);
  });

  it('should export initialGameState', () => {
    expect(typeExports.initialGameState).toBeDefined();
    expect(typeExports.initialGameState.mode).toBe('solo');
  });

  it('should export storage helper functions', () => {
    expect(typeof typeExports.getAverageScore).toBe('function');
    expect(typeof typeExports.getWinRate).toBe('function');
  });

  it('should export storage constants', () => {
    expect(typeExports.DEFAULT_SETTINGS).toBeDefined();
    expect(typeExports.DEFAULT_STATS).toBeDefined();
    expect(typeExports.STORAGE_KEY).toBe('nyan-poker-data');
    expect(typeExports.CURRENT_VERSION).toBe(1);
  });
});

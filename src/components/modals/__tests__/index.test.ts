// components/modals/__tests__/index.test.ts

import { describe, it, expect } from 'vitest';
import { RulesModal, SettingsModal, StatsModal } from '../index';

describe('modals index exports', () => {
  it('exports RulesModal component', () => {
    expect(RulesModal).toBeDefined();
    expect(typeof RulesModal).toBe('function');
  });

  it('exports SettingsModal component', () => {
    expect(SettingsModal).toBeDefined();
    expect(typeof SettingsModal).toBe('function');
  });

  it('exports StatsModal component', () => {
    expect(StatsModal).toBeDefined();
    expect(typeof StatsModal).toBe('function');
  });
});

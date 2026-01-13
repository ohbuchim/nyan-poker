import { describe, it, expect } from 'vitest';
import * as modalsExports from '../index';

describe('modals index exports', () => {
  it('exports RulesModal component', () => {
    expect(modalsExports.RulesModal).toBeDefined();
    expect(typeof modalsExports.RulesModal).toBe('function');
  });

  it('exports SettingsModal component', () => {
    expect(modalsExports.SettingsModal).toBeDefined();
    expect(typeof modalsExports.SettingsModal).toBe('function');
  });
});

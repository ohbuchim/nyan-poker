// components/modals/__tests__/index.test.ts

import { describe, it, expect } from 'vitest';
import { StatsModal } from '../index';

describe('modals index exports', () => {
  it('exports StatsModal component', () => {
    expect(StatsModal).toBeDefined();
    expect(typeof StatsModal).toBe('function');
  });
});

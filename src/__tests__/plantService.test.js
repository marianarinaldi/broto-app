import { describe, expect, it } from '@jest/globals';

import { calculateNextCareDate } from '../utils/watering';

describe('calculateNextCareDate', () => {
  it('adds the watering interval to the watering date', () => {
    const result = calculateNextCareDate('2026-11-11T12:00:00.000Z', '7');

    expect(result.toISOString()).toBe('2026-11-18T12:00:00.000Z');
  });

  it('rejects invalid watering intervals', () => {
    expect(() => calculateNextCareDate('2026-11-11T12:00:00.000Z', '0')).toThrow(
      'A frequência de rega deve ser um número maior que zero.',
    );
  });
});

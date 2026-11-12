import { describe, expect, it } from '@jest/globals';

import { calculateNextCareDate, getWateringStatus } from '../utils/watering';

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

  it('identifies a plant that should be watered today', () => {
    const now = new Date('2026-11-11T12:00:00.000Z');
    const result = getWateringStatus(
      { nextCareDate: '2026-11-11T09:00:00.000Z' },
      now,
    );

    expect(result).toEqual({ label: 'Regar hoje', tone: 'today', isDue: true });
  });
});

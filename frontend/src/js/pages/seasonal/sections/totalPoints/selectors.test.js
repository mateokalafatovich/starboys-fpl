import { describe, it, expect } from 'vitest';
import { toTotalPointsSeries } from './selectors';

const leagueProgression = [
  {
    'gameweek': 1,
    'Roadgers 2 Glory': 72,
    'XI Legend 99': 52,
    'InsanityTriggz': 33,
  },
  {
    'gameweek': 2,
    'Roadgers 2 Glory': 165,
    'XI Legend 99': 140,
    'InsanityTriggz': 79,
  },
  {
    'gameweek': 10,
    'Roadgers 2 Glory': 643,
    'XI Legend 99': 663,
    'InsanityTriggz': 500,
  }
];

const expectedSeries = [
  { name: 'InsanityTriggz', values: [33, 79, null, null, null, null, null, null, null, 500] },
  { name: 'Roadgers 2 Glory', values: [72, 165, null, null, null, null, null, null, null, 643] },
  { name: 'XI Legend 99', values: [52, 140, null, null, null, null, null, null, null, 663] },
];

describe('toTotalPointsSeries', () => {
  describe('league progression with a gap in the middle', () => {
    const result = toTotalPointsSeries(leagueProgression);

    it('labels every gameweek from the first through the last, including weeks with no row', () => {
      expect(result.labels).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('returns one series per manager, sorted by name', () => {
      expect(result.series.map((series) => series.name)).toEqual(
        expectedSeries.map((series) => series.name),
      );
    });

    it('lines each manager’s totals up with all gameweeks', () => {
      expect(result.series).toEqual(expectedSeries);
    });

    it('uses null for gameweeks that have no recorded total', () => {
      for(const series of result.series) {
        expect(series.values).toHaveLength(10);
        expect(series.values[3]).toBeNull();
        expect(series.values[4]).toBeNull();
        expect(series.values[5]).toBeNull();
        expect(series.values[6]).toBeNull();
        expect(series.values[7]).toBeNull();
        expect(series.values[8]).toBeNull();
      }
    });
  });

  it('uses null when a manager is absent from a gameweek that other managers played', () => {
    const result = toTotalPointsSeries([
      { gameweek: 1, bob: 20, john: 24 },
      { gameweek: 2, bob: 82, john: 102 },
      { gameweek: 3, john: 157 },
    ]);

    expect(result).toEqual({
      labels: [1, 2, 3],
      series: [
        { name: 'bob', values: [20, 82, null] },
        { name: 'john', values: [24, 102, 157] },
      ],
    });
  });

  it('orders labels and values by gameweek when the rows arrive out of order', () => {
    const result = toTotalPointsSeries([
      { gameweek: 3, ada: 30 },
      { gameweek: 1, ada: 10 },
      { gameweek: 2, ada: 20 },
    ]);

    expect(result).toEqual({
      labels: [1, 2, 3],
      series: [{ name: 'ada', values: [10, 20, 30] }],
    });
  });

  it('fills the span from gameweek 1 to the latest gameweek', () => {
    const result = toTotalPointsSeries([
      { gameweek: 8, ada: 80 },
      { gameweek: 10, ada: 100 },
    ]);

    expect(result).toEqual({
      labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      series: [{ name: 'ada', values: [null, null, null, null, null, null, null, 80, null, 100] }],
    });
  });

  it('includes a manager who appears for the first time in a later gameweek', () => {
    const result = toTotalPointsSeries([
      { gameweek: 1, ada: 10 },
      { gameweek: 2, ada: 20, bea: 15 },
    ]);

    expect(result.series).toEqual([
      { name: 'ada', values: [10, 20] },
      { name: 'bea', values: [null, 15] },
    ]);
  });

  it('keeps the latest row when the same gameweek is reported twice', () => {
    const result = toTotalPointsSeries([
      { gameweek: 1, ada: 10 },
      { gameweek: 1, ada: 12 },
    ]);

    expect(result).toEqual({
      labels: [1],
      series: [{ name: 'ada', values: [12] }],
    });
  });

  it('returns all labels up to the one gameweek that has data', () => {
    expect(toTotalPointsSeries([{ gameweek: 4, ada: 40 }])).toEqual({
      labels: [1, 2, 3, 4],
      series: [{ name: 'ada', values: [null, null, null, 40] }],
    });
  });

  it('returns empty labels and series for no data', () => {
    expect(toTotalPointsSeries([])).toEqual({ labels: [], series: [] });
  });
});

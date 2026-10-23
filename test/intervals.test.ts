import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

// Pick two endpoints, then order them. This constructs valid intervals
// instead of discarding invalid ones with filter or fc.pre.
const endpoint = fc.integer({ min: -30, max: 30 });
const interval: fc.Arbitrary<Interval> = fc.tuple(endpoint, endpoint).map(([a, b]) =>
  a <= b ? [a, b] : [b, a],
);
const intervalList = fc.array(interval, { maxLength: 10 });

// Construct a sorted list with a nonempty gap after every interval.
const disjointIntervalList: fc.Arbitrary<Interval[]> = fc
  .array(fc.tuple(fc.nat(4), fc.nat(6)), { maxLength: 8 })
  .map(parts => {
    let nextStart = -30;
    return parts.map(([gap, length]) => {
      const start = nextStart + gap;
      const end = start + length;
      nextStart = end + 1;
      return [start, end] as Interval;
    });
  });

const covers = (intervals: readonly Interval[], point: number) =>
  intervals.some(([start, end]) => start <= point && point <= end);

describe('mergeIntervals', () => {
  // Pattern: invariant. Output is sorted, disjoint, and does not contain touching intervals.
  it('returns sorted intervals with gaps between consecutive intervals', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        for (let i = 0; i < out.length - 1; i++) {
          expect(out[i][0]).toBeLessThan(out[i + 1][0]);
          expect(out[i][1]).toBeLessThan(out[i + 1][0]);
        }
      }),
    );
  });

  // Pattern: invariant. Merging does not modify the input array or its interval pairs.
  it('does not mutate its input', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const before = xs.map(([start, end]) => [start, end] as Interval);
        mergeIntervals(xs);
        expect(xs).toEqual(before);
      }),
    );
  });

  // Pattern: differential. Input and output cover exactly the same points.
  it('preserves whether a point is covered', () => {
    fc.assert(
      fc.property(intervalList, endpoint, (xs, point) => {
        expect(covers(mergeIntervals(xs), point)).toBe(covers(xs, point));
      }),
    );
  });

  // Pattern: metamorphic. Reversing the input order does not change the merged result.
  it('is unaffected by input order', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        expect(mergeIntervals([...xs].reverse())).toEqual(mergeIntervals(xs));
      }),
    );
  });

  // Pattern: algebraic. Merging an already merged list changes nothing.
  it('is idempotent', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const once = mergeIntervals(xs);
        expect(mergeIntervals(once)).toEqual(once);
      }),
    );
  });

  // Pattern: conditional. A sorted input with gaps between intervals is returned unchanged.
  it('keeps already-disjoint intervals unchanged', () => {
    fc.assert(
      fc.property(disjointIntervalList, xs => {
        expect(mergeIntervals(xs)).toEqual(xs);
      }),
    );
  });
});

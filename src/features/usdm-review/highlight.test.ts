import { highlightQuotes } from './highlight';

describe('highlightQuotes', () => {
  it('marks every quote found, ignoring case, and keeps the rest as plain text', () => {
    expect(
      highlightQuotes('Arm A: zelvatinib 200 mg. Arm B: placebo.', [
        { id: 'b', quote: 'arm b: placebo' },
        { id: 'a', quote: 'zelvatinib 200 mg' },
        { id: 'x', quote: 'not there' },
      ]),
    ).toEqual([
      { text: 'Arm A: ', markId: null },
      { text: 'zelvatinib 200 mg', markId: 'a' },
      { text: '. ', markId: null },
      { text: 'Arm B: placebo', markId: 'b' },
      { text: '.', markId: null },
    ]);
  });

  it('skips a match that overlaps an earlier one', () => {
    expect(
      highlightQuotes('Phase 3 study', [
        { id: 'a', quote: 'Phase 3' },
        { id: 'b', quote: '3 study' },
      ]).map((s) => s.markId),
    ).toEqual(['a', null]);
  });
});

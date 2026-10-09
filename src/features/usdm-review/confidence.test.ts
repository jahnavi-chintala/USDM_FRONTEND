import { classConfidence, overallConfidence } from './confidence';

describe('classConfidence', () => {
  it('follows the review decision', () => {
    expect(classConfidence({ status: 'approved', model_confidence: 40 })).toBe(100);
    expect(classConfidence({ status: 'edited', model_confidence: 40 })).toBe(95);
    expect(classConfidence({ status: 'rejected', model_confidence: 90 })).toBe(30);
    expect(classConfidence({ status: 'rejected', model_confidence: 20 })).toBe(20);
    expect(classConfidence({ status: 'pending', model_confidence: 72 })).toBe(72);
    expect(classConfidence({ status: 'reextracting', model_confidence: 72 })).toBe(72);
  });
});

describe('overallConfidence', () => {
  it('averages the classes and rounds', () => {
    expect(
      overallConfidence([
        { status: 'approved', model_confidence: 50 },
        { status: 'pending', model_confidence: 71 },
      ]),
    ).toBe(86);
    expect(overallConfidence([])).toBe(0);
  });
});

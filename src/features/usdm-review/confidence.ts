import type { UsdmClass } from './types';

/**
 * Confidence of a class after review (to be confirmed with the product owner, as noted on
 * the design): approved 100, edited 95, rejected at most 30, otherwise the model's score.
 */
export function classConfidence(usdmClass: Pick<UsdmClass, 'status' | 'model_confidence'>): number {
  switch (usdmClass.status) {
    case 'approved':
      return 100;
    case 'edited':
      return 95;
    case 'rejected':
      return Math.min(usdmClass.model_confidence, 30);
    default:
      return usdmClass.model_confidence;
  }
}

/** The protocol's overall confidence: the average over its classes, rounded. */
export function overallConfidence(
  classes: Pick<UsdmClass, 'status' | 'model_confidence'>[],
): number {
  if (!classes.length) return 0;
  const total = classes.reduce((sum, c) => sum + classConfidence(c), 0);
  return Math.round(total / classes.length);
}

/** Below this, a pending class is flagged as low confidence. */
export const LOW_CONFIDENCE = 65;

import type { ConversionReport, UsdmDocument } from '@/features/convert/types';

/** A small, synthetic USDM 4.0 wrapper. No real protocol data. */
export const sampleUsdm: UsdmDocument = {
  usdmVersion: '4.0.0',
  systemName: 'USDM4-Assure',
  systemVersion: '0.3.0',
  study: {
    id: 'Study_1',
    name: 'ZV-210-201',
    instanceType: 'Study',
    versions: [
      {
        id: 'StudyVersion_1',
        versionIdentifier: '2.0',
        rationale: 'Amendment 2',
        titles: [
          {
            id: 'StudyTitle_1',
            text: 'A Phase 2, Randomised, Double-Blind Study of ZV-210 in Adults with Advanced Solid Tumours',
            type: { code: 'C207616', decode: 'Official Study Title' },
          },
        ],
        studyIdentifiers: [
          { id: 'StudyIdentifier_1', text: 'ZV-210-201', scopeId: 'Organization_1' },
        ],
        studyDesigns: [
          {
            id: 'StudyDesign_1',
            arms: [
              { id: 'StudyArm_1', name: 'ZV-210 200 mg' },
              { id: 'StudyArm_2', name: 'Placebo' },
            ],
            epochs: [
              { id: 'StudyEpoch_1', name: 'Screening' },
              { id: 'StudyEpoch_2', name: 'Treatment' },
              { id: 'StudyEpoch_3', name: 'Follow-up' },
            ],
            objectives: [
              {
                id: 'Objective_1',
                text: 'To evaluate the objective response rate of ZV-210.',
                level: { code: 'C85826', decode: 'Primary Objective' },
              },
            ],
          },
        ],
      },
    ],
  },
};

export function sampleReport(runId: string): ConversionReport {
  return {
    llm: true,
    core_requested: false,
    run_id: runId,
    source_sha256: '3f2a9c1b7e4d5a60b8c2d9e1f0a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9',
    decision_summary: { auto_accept: 41, review: 7, block: 2 },
    validation: {
      structural: { passed: true },
      d4k: {
        passed: false,
        rules_run: 213,
        findings: 5,
        failed_rules: ['DDF00081', 'DDF00094', 'DDF00125', 'DDF00141', 'DDF00187'],
      },
      core: { skipped: 'run_core=False' },
    },
    findings: 9,
  };
}

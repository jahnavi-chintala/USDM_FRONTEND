import type { SoaGrid } from '@/features/usdm-review/types';

/**
 * Synthetic protocol content for the mock API. Every quote appears word for word on its
 * source page (see `sourcePage` in db.ts), so the highlights can be tried by hand.
 */

export interface FieldTemplate {
  label: string;
  value: string;
  quote: string;
}

export interface ClassTemplate {
  id: string;
  name: string;
  usdm_classes: string[];
  page: number;
  model_confidence: number;
  fields: FieldTemplate[];
  soa?: SoaGrid;
}

export const CLASS_TEMPLATES: ClassTemplate[] = [
  {
    id: 'study-identifiers',
    name: 'Study & Identifiers',
    usdm_classes: ['Study', 'StudyIdentifier'],
    page: 1,
    model_confidence: 96,
    fields: [
      {
        label: 'Study title',
        value:
          'A Phase 3, Randomised, Double-blind Study of Zelvatinib versus Placebo in Adults with Advanced Solid Tumours',
        quote:
          'A Phase 3, Randomised, Double-blind Study of Zelvatinib versus Placebo in Adults with Advanced Solid Tumours',
      },
      { label: 'Acronym', value: 'ALPHA-301', quote: '(ALPHA-301)' },
      { label: 'Sponsor protocol ID', value: 'ZLV-3-0301', quote: 'Protocol Number: ZLV-3-0301' },
    ],
  },
  {
    id: 'organizations',
    name: 'Organizations',
    usdm_classes: ['Organization'],
    page: 1,
    model_confidence: 88,
    fields: [
      {
        label: 'Sponsor',
        value: 'Northwind Therapeutics Ltd.',
        quote: 'Sponsor: Northwind Therapeutics Ltd.',
      },
      {
        label: 'Address',
        value: '12 Harbour Road, Cambridge, UK',
        quote: '12 Harbour Road, Cambridge, UK',
      },
    ],
  },
  {
    id: 'study-design',
    name: 'Study Design',
    usdm_classes: ['InterventionalStudyDesign'],
    page: 4,
    model_confidence: 91,
    fields: [
      {
        label: 'Design type',
        value: 'Randomised, double-blind, placebo-controlled, parallel-group',
        quote: 'randomised, double-blind, placebo-controlled, parallel-group',
      },
      { label: 'Phase', value: 'Phase 3', quote: 'This Phase 3 study' },
      {
        label: 'Planned enrolment',
        value: '480 participants',
        quote: 'approximately 480 participants',
      },
    ],
  },
  {
    id: 'arms',
    name: 'Arms',
    usdm_classes: ['StudyArm'],
    page: 4,
    model_confidence: 84,
    fields: [
      {
        label: 'Arm A',
        value: 'Zelvatinib 200 mg once daily',
        quote: 'Arm A: zelvatinib 200 mg once daily',
      },
      {
        label: 'Arm B',
        value: 'Matching placebo once daily',
        quote: 'Arm B: matching placebo once daily',
      },
    ],
  },
  {
    id: 'epochs',
    name: 'Epochs',
    usdm_classes: ['StudyEpoch'],
    page: 4,
    model_confidence: 79,
    fields: [
      {
        label: 'Epochs',
        value: 'Screening · Treatment · Follow-up',
        quote: 'Screening (up to 28 days), Treatment and Follow-up',
      },
    ],
  },
  {
    id: 'objectives-endpoints',
    name: 'Objectives & Endpoints',
    usdm_classes: ['Objective', 'Endpoint'],
    page: 6,
    model_confidence: 72,
    fields: [
      {
        label: 'Primary objective',
        value: 'Compare progression-free survival between zelvatinib and placebo',
        quote: 'To compare progression-free survival (PFS) between zelvatinib and placebo',
      },
      {
        label: 'Primary endpoint',
        value: 'PFS per RECIST 1.1 by blinded central review',
        quote: 'PFS per RECIST 1.1 as assessed by blinded independent central review',
      },
    ],
  },
  {
    id: 'eligibility',
    name: 'Eligibility Criteria',
    usdm_classes: ['EligibilityCriterion'],
    page: 7,
    model_confidence: 64,
    fields: [
      {
        label: 'Inclusion 1',
        value: 'Age ≥ 18 years at informed consent',
        quote: 'Age ≥ 18 years at the time of signing informed consent',
      },
      {
        label: 'Inclusion 2',
        value: 'ECOG performance status 0–1',
        quote: 'ECOG performance status of 0 or 1',
      },
      {
        label: 'Exclusion 1',
        value: 'Prior TKI of the same class',
        quote: 'Prior treatment with any tyrosine kinase inhibitor of the same class',
      },
    ],
  },
  {
    id: 'interventions',
    name: 'Interventions',
    usdm_classes: ['StudyIntervention'],
    page: 8,
    model_confidence: 87,
    fields: [
      {
        label: 'Investigational product',
        value: 'Zelvatinib 100 mg film-coated tablet',
        quote: 'zelvatinib 100 mg film-coated tablets',
      },
      { label: 'Route', value: 'Oral', quote: 'administered orally' },
    ],
  },
  {
    id: 'schedule-of-activities',
    name: 'Schedule of Activities',
    usdm_classes: ['ScheduleTimeline', 'Activity'],
    page: 10,
    model_confidence: 58,
    fields: [
      {
        label: 'Visits',
        value: 'Screening, Day 1, Week 4, Week 8, End of Treatment, Follow-up',
        quote: 'Table 3 Schedule of Activities',
      },
      {
        label: 'Imaging cadence',
        value: 'Every 8 weeks from Day 1',
        quote: 'every 8 weeks (± 7 days)',
      },
    ],
    soa: {
      visits: ['Screen', 'D1', 'W4', 'W8', 'EoT', 'FU'],
      activities: [
        ['Informed consent', 'x-----'],
        ['Vital signs', 'xxxxxx'],
        ['12-lead ECG', 'xx-xx-'],
        ['Tumour imaging', 'x--xx-'],
        ['Haematology', 'xxxxx-'],
        ['Adverse events', '-xxxxx'],
      ].map(([name, marks]) => ({
        name: name!,
        scheduled: marks!.split('').map((mark) => mark === 'x'),
      })),
    },
  },
];

/** Text around the quotes on each page, so the source reads like a protocol. */
export const PAGE_FILLER = {
  opening:
    'The investigator will ensure that the study is conducted in accordance with the protocol, ICH E6 Good Clinical Practice and applicable regulatory requirements.',
  closing:
    'All study procedures are described in the sections that follow and apply to every participant enrolled in the study.',
};

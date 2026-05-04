import type { EventCategory, Patient, TimelineEvent, Trend } from '../types';

export const patient: Patient = {
  name: 'Maria Thompson',
  age: 72,
  sex: 'Female',
  insurance: 'Medicare Advantage',
  conditions: ['CHF', 'T2D', 'CKD3', 'HTN'],
  riskLevel: 'High',
  lastVisit: 'Mar 21, 2026',
  recentAcuteCount: '1 ED visit / 1 hospitalization in 12M',
  concern: '+7 lb since discharge'
};

export const categories: EventCategory[] = [
  'Encounters',
  'Medications',
  'Labs & Vitals',
  'Care Gaps',
  'Clinical Signals'
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'problem-chf',
    date: '2025-05-08',
    category: 'Clinical Signals',
    title: 'CHF added to high-risk watchlist',
    severity: 'moderate',
    source: 'Care management risk rules',
    summary: 'Known CHF with CKD and prior acute utilization increases preventable ED risk.',
    whyItMatters: 'CHF combined with CKD and diabetes raises the clinical impact of fluid shifts and medication non-adherence.',
    evidence: ['CHF active problem', 'CKD stage 3 active problem', 'Medicare Advantage high-risk roster'],
    suggestedAction: 'Confirm baseline dry weight and update CHF self-management plan.'
  },
  {
    id: 'pcp-june',
    date: '2025-06-03',
    category: 'Encounters',
    title: 'PCP follow-up',
    severity: 'low',
    source: 'Primary care note',
    summary: 'Stable chronic disease visit with BP above goal.',
    whyItMatters: 'BP control affects CHF, CKD progression, and cardiovascular risk.',
    evidence: ['BP 146/86', 'No edema documented', 'A1c due in next quarter'],
    suggestedAction: 'Recheck home BP log and reinforce low-sodium diet.'
  },
  {
    id: 'a1c-82',
    date: '2025-07-15',
    category: 'Labs & Vitals',
    title: 'A1c 8.2%',
    severity: 'moderate',
    source: 'Lab result',
    summary: 'A1c trending above individualized goal.',
    whyItMatters: 'Worsening glycemic control can accelerate kidney decline and complicate CHF management.',
    evidence: ['A1c rose from 7.6% to 8.2%', 'Fasting glucose often above 160 mg/dL'],
    suggestedAction: 'Review adherence, hypoglycemia history, and medication affordability.'
  },
  {
    id: 'furosemide-refill',
    date: '2025-08-04',
    category: 'Medications',
    title: 'Furosemide refill gap',
    severity: 'high',
    source: 'Pharmacy claims',
    summary: 'Late refill suggests inconsistent diuretic adherence.',
    whyItMatters: 'Missed diuretic doses can contribute to fluid retention and CHF decompensation.',
    evidence: ['Last fill 42 days prior for 30-day supply', 'Patient reports skipping doses when leaving home'],
    suggestedAction: 'Ask about barriers and consider a dosing plan that fits daily routine.'
  },
  {
    id: 'ed-sept',
    date: '2025-09-09',
    category: 'Encounters',
    title: 'ED visit for dyspnea',
    severity: 'high',
    source: 'ADT feed',
    summary: 'Evaluated for shortness of breath and ankle swelling; discharged home.',
    whyItMatters: 'Dyspnea with edema may represent early CHF worsening even when discharge is appropriate.',
    evidence: ['Chest x-ray: mild vascular congestion', 'BNP 420 pg/mL', 'Discharged with PCP follow-up recommendation'],
    suggestedAction: 'Review ED course and ensure post-ED follow-up plan was completed.'
  },
  {
    id: 'egfr-43',
    date: '2025-10-18',
    category: 'Labs & Vitals',
    title: 'eGFR declined to 43',
    severity: 'moderate',
    source: 'Lab result',
    summary: 'Kidney function shows gradual decline over the year.',
    whyItMatters: 'CKD progression affects medication selection, diuretic dosing, and cardiovascular risk.',
    evidence: ['eGFR 52 in May 2025', 'eGFR 43 in Oct 2025', 'Creatinine 1.35 mg/dL'],
    suggestedAction: 'Review nephrotoxic medications and confirm nephrology referral status.'
  },
  {
    id: 'hospital-nov',
    date: '2025-11-22',
    category: 'Encounters',
    title: 'Hospitalized for CHF exacerbation',
    severity: 'critical',
    source: 'Hospital discharge summary',
    summary: 'Two-day admission for volume overload treated with IV diuresis.',
    whyItMatters: 'Recent CHF hospitalization is a strong predictor of readmission and preventable ED use.',
    evidence: ['IV diuresis with 6 lb weight reduction', 'Discharge weight 181 lb', 'Cardiology follow-up requested within 14 days'],
    suggestedAction: 'Confirm discharge medication changes and follow-up completion.'
  },
  {
    id: 'lisinopril',
    date: '2025-12-02',
    category: 'Medications',
    title: 'Lisinopril continued',
    severity: 'low',
    source: 'Medication list',
    summary: 'ACE inhibitor continued after hospitalization.',
    whyItMatters: 'Supports hypertension and kidney protection, but renal function and potassium should be monitored.',
    evidence: ['Lisinopril 20 mg daily', 'Potassium 4.8 mmol/L after discharge'],
    suggestedAction: 'Repeat BMP if not completed after medication reconciliation.'
  },
  {
    id: 'cardiology-gap',
    date: '2026-02-08',
    category: 'Care Gaps',
    title: 'Missed cardiology follow-up',
    severity: 'moderate',
    source: 'Referral tracking',
    summary: 'Cardiology follow-up after CHF hospitalization was not completed.',
    whyItMatters: 'Missed post-discharge cardiology follow-up leaves medication optimization and volume status unresolved.',
    evidence: ['Appointment no-show on Feb 8', 'No subsequent cardiology visit found', 'CHF admission in Nov 2025'],
    suggestedAction: 'Reschedule cardiology and address transportation or access barriers.'
  },
  {
    id: 'a1c-overdue',
    date: '2026-02-10',
    category: 'Care Gaps',
    title: 'A1c overdue',
    severity: 'moderate',
    source: 'Quality gap engine',
    summary: 'Diabetes monitoring is overdue.',
    whyItMatters: 'A current A1c is needed to assess whether diabetes control is worsening and whether therapy should change.',
    evidence: ['Last A1c was Jul 15, 2025', 'Prior A1c 8.2%'],
    suggestedAction: 'Order A1c today and review glucose log.'
  },
  {
    id: 'bp-weight-march',
    date: '2026-03-21',
    category: 'Labs & Vitals',
    title: 'Weight up 7 lb, BP 154/90',
    severity: 'moderate',
    source: 'PCP vitals',
    summary: 'Weight and blood pressure increased at recent PCP visit.',
    whyItMatters: 'Rapid weight gain in CHF can indicate fluid retention, especially with dyspnea and diuretic gaps.',
    evidence: ['Weight 188 lb, up from 181 lb post-discharge', 'BP 154/90', 'Trace bilateral edema'],
    suggestedAction: 'Assess volume status, adherence, diet, and need for diuretic adjustment.'
  },
  {
    id: 'insulin-adjustment',
    date: '2026-03-21',
    category: 'Medications',
    title: 'Insulin adjustment discussed',
    severity: 'moderate',
    source: 'Primary care note',
    summary: 'Basal insulin titration considered due to elevated home glucose readings.',
    whyItMatters: 'Diabetes control appears to be worsening while kidney function limits some medication options.',
    evidence: ['Home fasting glucose 170-210 mg/dL', 'A1c overdue', 'CKD stage 3'],
    suggestedAction: 'Update A1c and adjust insulin using a clear titration plan if appropriate.'
  },
  {
    id: 'med-rec-gap',
    date: '2026-04-04',
    category: 'Care Gaps',
    title: 'Medication reconciliation needed',
    severity: 'high',
    source: 'Care manager call',
    summary: 'Patient is unsure whether she should take furosemide every day.',
    whyItMatters: 'Unclear medication instructions can directly contribute to CHF worsening and ED utilization.',
    evidence: ['Patient reports taking furosemide only when legs swell', 'Pharmacy refill gap noted in Aug 2025'],
    suggestedAction: 'Reconcile medications today and provide simple written CHF action plan.'
  },
  {
    id: 'bnp-april',
    date: '2026-04-15',
    category: 'Labs & Vitals',
    title: 'BNP elevated to 690',
    severity: 'high',
    source: 'Lab result',
    summary: 'BNP increased substantially compared with prior ED value.',
    whyItMatters: 'BNP elevation supports concern for worsening heart failure when combined with symptoms and weight gain.',
    evidence: ['BNP 690 pg/mL', 'BNP 420 pg/mL during Sep ED visit', 'Reports shortness of breath on stairs'],
    suggestedAction: 'Evaluate for CHF exacerbation and consider same-day treatment plan or urgent cardiology input.'
  },
  {
    id: 'kidney-risk',
    date: '2026-04-18',
    category: 'Clinical Signals',
    title: 'Kidney function decline',
    severity: 'moderate',
    source: 'Risk model over labs',
    summary: 'CKD stage 3 with downward eGFR trend and CHF medication complexity.',
    whyItMatters: 'Renal decline may limit therapy choices and increases risk from aggressive diuresis.',
    evidence: ['eGFR 52 to 39 over 12 months', 'CHF and hypertension active', 'Nephrology referral still pending'],
    suggestedAction: 'Order BMP, review renal dosing, and complete nephrology referral.'
  },
  {
    id: 'nephrology-referral',
    date: '2026-04-19',
    category: 'Care Gaps',
    title: 'Nephrology referral pending',
    severity: 'moderate',
    source: 'Referral queue',
    summary: 'Referral placed but not scheduled.',
    whyItMatters: 'CKD progression needs specialty input, especially with CHF and diabetes.',
    evidence: ['Referral open for 34 days', 'eGFR near 39', 'Albuminuria not recently checked'],
    suggestedAction: 'Have staff schedule referral and order urine albumin-to-creatinine ratio.'
  },
  {
    id: 'diabetes-risk',
    date: '2026-04-21',
    category: 'Clinical Signals',
    title: 'Diabetes control worsening',
    severity: 'moderate',
    source: 'Risk model over labs and notes',
    summary: 'A1c overdue with elevated home glucose readings.',
    whyItMatters: 'Poor glycemic control increases kidney and cardiovascular risk.',
    evidence: ['Last A1c 8.2%', 'Fasting glucose 170-210 mg/dL', 'Insulin adjustment discussed but not completed'],
    suggestedAction: 'Order A1c and finalize diabetes medication plan.'
  },
  {
    id: 'preventable-ed',
    date: '2026-04-24',
    category: 'Clinical Signals',
    title: 'Preventable ED risk rising',
    severity: 'high',
    source: 'Care management risk model',
    summary: 'Multiple unresolved issues increase avoidable acute care risk.',
    whyItMatters: 'Combining acute utilization, missed follow-up, symptoms, and medication confusion suggests a closing intervention window.',
    evidence: ['Prior CHF hospitalization', 'Missed cardiology follow-up', 'Medication reconciliation gap', 'Shortness of breath reported'],
    suggestedAction: 'Create a same-day CHF plan and assign care manager follow-up within 48 hours.'
  },
  {
    id: 'chf-worsening',
    date: '2026-04-27',
    category: 'Clinical Signals',
    title: 'Possible CHF worsening',
    severity: 'critical',
    source: 'AI synthesis from vitals, labs, claims, care notes',
    summary: 'Possible fluid overload with rising short-term ED risk.',
    whyItMatters: 'Signals possible fluid overload and increased short-term ED risk.',
    evidence: [
      'Weight 181 -> 188 lb',
      'BNP 690 pg/mL',
      'Dyspnea on stairs',
      'Furosemide taken inconsistently',
      'Cardiology follow-up missed'
    ],
    interpretation: ['Signals possible fluid overload', 'Increased short-term ED risk'],
    actions: [
      'Assess volume status',
      'Review diuretic adherence',
      'Order BMP/BNP',
      'Schedule cardiology follow-up',
      'Arrange care manager follow-up within 48h'
    ],
    suggestedAction: 'Assess volume status; review diuretic adherence; order BMP/BNP; schedule cardiology; arrange 48h follow-up.'
  }
];

export const trends: Trend[] = [
  {
    title: 'Weight',
    unit: 'lb',
    status: '↑ since discharge',
    tone: 'risk',
    points: [
      { date: '2025-05-01', value: 184 },
      { date: '2025-09-09', value: 186 },
      { date: '2025-11-24', value: 181 },
      { date: '2026-03-21', value: 188 },
      { date: '2026-04-27', value: 190 }
    ]
  },
  {
    title: 'A1c',
    unit: '%',
    status: 'overdue / high',
    tone: 'watch',
    points: [
      { date: '2025-01-10', value: 7.6 },
      { date: '2025-07-15', value: 8.2 },
      { date: '2026-03-21', value: 8.5 }
    ]
  },
  {
    title: 'eGFR',
    unit: '',
    status: 'downward trend',
    tone: 'watch',
    points: [
      { date: '2025-05-08', value: 52 },
      { date: '2025-10-18', value: 43 },
      { date: '2026-04-15', value: 39 }
    ]
  },
  {
    title: 'Blood Pressure',
    unit: 'mmHg systolic',
    status: 'above goal',
    tone: 'risk',
    points: [
      { date: '2025-06-03', value: 146 },
      { date: '2025-09-09', value: 150 },
      { date: '2026-03-21', value: 154 },
      { date: '2026-04-27', value: 152 }
    ]
  }
];

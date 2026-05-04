export type EventCategory = 'Encounters' | 'Medications' | 'Labs & Vitals' | 'Care Gaps' | 'Clinical Signals';

export type Severity = 'low' | 'moderate' | 'high' | 'critical';

export type TimelineEvent = {
  id: string;
  date: string;
  category: EventCategory;
  title: string;
  severity: Severity;
  source: string;
  summary: string;
  whyItMatters: string;
  evidence: string[];
  suggestedAction: string;
  interpretation?: string[];
  actions?: string[];
};

export type Patient = {
  name: string;
  age: number;
  sex: string;
  insurance: string;
  conditions: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  lastVisit: string;
  recentAcuteCount: string;
  concern: string;
};

export type TrendPoint = {
  date: string;
  value: number;
  label?: string;
};

export type Trend = {
  title: string;
  unit: string;
  status: string;
  tone: 'good' | 'watch' | 'risk';
  points: TrendPoint[];
};

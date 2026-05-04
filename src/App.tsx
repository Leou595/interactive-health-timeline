import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories, patient, timelineEvents, trends } from './data/mockPatient';
import type { EventCategory, Severity, TimelineEvent, Trend } from './types';

const REFERENCE_DATE = new Date('2026-05-03T12:00:00');
const DAY_MS = 1000 * 60 * 60 * 24;

const severityStyles: Record<Severity, string> = {
  low: 'border-slate-200 bg-white text-slate-600',
  moderate: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  high: 'border-orange-200 bg-orange-50 text-orange-900',
  critical: 'border-red-300 bg-red-50 text-red-950'
};

const categoryStyles: Record<EventCategory, string> = {
  Encounters: 'bg-sky-50 border-sky-200 text-sky-800',
  Medications: 'bg-teal-50 border-teal-200 text-teal-800',
  'Labs & Vitals': 'bg-violet-50 border-violet-200 text-violet-800',
  'Care Gaps': 'bg-orange-50 border-orange-200 text-orange-900',
  'Clinical Signals': 'bg-red-50 border-red-200 text-red-900'
};

const laneAccent: Record<EventCategory, string> = {
  Encounters: 'text-sky-600',
  Medications: 'text-teal-600',
  'Labs & Vitals': 'text-violet-600',
  'Care Gaps': 'text-orange-600',
  'Clinical Signals': 'text-red-600'
};

const laneBands: Record<EventCategory, string> = {
  Encounters: 'bg-sky-50/45',
  Medications: 'bg-teal-50/45',
  'Labs & Vitals': 'bg-violet-50/45',
  'Care Gaps': 'bg-orange-50/45',
  'Clinical Signals': 'bg-red-50/45'
};

const conditionLabels: Record<string, string> = {
  CHF: 'CHF - Congestive Heart Failure',
  T2D: 'T2D - Type 2 Diabetes',
  CKD3: 'CKD3 - Chronic Kidney Disease Stage 3',
  HTN: 'HTN - Hypertension'
};

const eventCategoryStyles: Record<EventCategory, string> = {
  Encounters: 'border-sky-300 bg-sky-50 text-sky-950',
  Medications: 'border-teal-300 bg-teal-50 text-teal-950',
  'Labs & Vitals': 'border-violet-300 bg-violet-50 text-violet-950',
  'Care Gaps': 'border-orange-300 bg-orange-50 text-orange-950',
  'Clinical Signals': 'border-red-300 bg-red-50 text-red-950'
};

const eventDotStyles: Record<EventCategory, string> = {
  Encounters: 'bg-sky-600',
  Medications: 'bg-teal-600',
  'Labs & Vitals': 'bg-violet-600',
  'Care Gaps': 'bg-orange-500',
  'Clinical Signals': 'bg-red-600'
};

const timeRanges = [
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '12M', days: 365 }
] as const;

const shortEventLabels: Record<string, string> = {
  'problem-chf': 'CHF watch',
  'pcp-june': 'PCP follow-up',
  'a1c-82': 'A1c 8.2',
  'furosemide-refill': 'Furosemide gap',
  'ed-sept': 'ED dyspnea',
  'egfr-43': 'eGFR 43',
  'hospital-nov': 'CHF admit',
  lisinopril: 'Lisinopril',
  'cardiology-gap': 'Cardiology missed',
  'a1c-overdue': 'A1c overdue',
  'bp-weight-march': 'Weight +7 lb',
  'insulin-adjustment': 'Insulin plan',
  'med-rec-gap': 'Med rec',
  'bnp-april': 'BNP 690',
  'kidney-risk': 'Kidney risk',
  'nephrology-referral': 'Nephrology pending',
  'diabetes-risk': 'Diabetes risk',
  'preventable-ed': 'ED risk',
  'chf-worsening': 'CHF risk'
};

const labeledEventIds = new Set([
  'cardiology-gap',
  'a1c-overdue',
  'bp-weight-march',
  'med-rec-gap',
  'bnp-april',
  'preventable-ed',
  'chf-worsening'
]);

const hiddenTimelineMarkerIds = new Set(['kidney-risk', 'diabetes-risk']);

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
}

function formatTrendTick(date: string) {
  const tickDate = new Date(`${date}T12:00:00`);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(tickDate);
  return `${month} '${String(tickDate.getFullYear()).slice(2)}`;
}

function formatTrendValue(value: number, unit: string) {
  const displayValue = Number.isInteger(value) ? String(value) : value.toFixed(1);
  if (unit === '%') return `${displayValue}%`;
  if (!unit) return displayValue;
  return `${displayValue} ${unit}`;
}

function formatTrendDelta(delta: number, unit: string) {
  const absDelta = Math.abs(delta);
  const displayDelta = Number.isInteger(absDelta) ? String(absDelta) : absDelta.toFixed(1);
  const sign = delta > 0 ? '+' : delta < 0 ? '-' : '';
  if (unit === '%') return `${sign}${displayDelta}%`;
  if (!unit) return `${sign}${displayDelta}`;
  return `${sign}${displayDelta} ${unit}`;
}

function daysBetween(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / DAY_MS);
}

function getWindowStart(days: number) {
  return new Date(REFERENCE_DATE.getTime() - days * DAY_MS);
}

function eventSearchText(event: TimelineEvent) {
  return [
    event.title,
    shortEventLabels[event.id],
    event.category,
    event.source,
    event.summary,
    event.whyItMatters,
    event.suggestedAction,
    ...event.evidence
  ]
    .join(' ')
    .toLowerCase();
}

function App() {
  const defaultEvent = timelineEvents.find((event) => event.id === 'chf-worsening') ?? timelineEvents[0];
  const [selectedEventId, setSelectedEventId] = useState(defaultEvent.id);
  const [rangeDays, setRangeDays] = useState(90);
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(new Set(categories));
  const [query, setQuery] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTrendsOpen, setIsTrendsOpen] = useState(true);

  const timelineStart = getWindowStart(rangeDays);
  const queryText = query.trim().toLowerCase();

  const filteredEvents = useMemo(() => {
    return timelineEvents
      .filter((event) => activeCategories.has(event.category))
      .filter((event) => new Date(`${event.date}T12:00:00`) >= timelineStart)
      .filter((event) => (queryText ? eventSearchText(event).includes(queryText) : true))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [activeCategories, queryText, timelineStart]);

  const selectedEvent = timelineEvents.find((event) => event.id === selectedEventId) ?? defaultEvent;
  const visibleCategories = categories.filter((category) => activeCategories.has(category));
  const monthTicks = useMemo(() => buildTicks(timelineStart, REFERENCE_DATE), [timelineStart]);
  const yearSegments = useMemo(() => buildYearSegments(timelineStart, REFERENCE_DATE), [timelineStart]);

  function toggleCategory(category: EventCategory) {
    const next = new Set(activeCategories);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    setActiveCategories(next.size ? next : new Set([category]));
  }

  function showAllCategories() {
    setActiveCategories(new Set(categories));
  }

  return (
    <main className="min-h-screen bg-white text-clinical-ink">
      <div className="mx-auto flex max-w-[1540px] flex-col border-x border-slate-200 bg-white">
        <PatientHeader />
        <PreVisitBrief />

        <section className="border-b border-slate-200">
          <SectionBar title="Interactive Health Timeline" icon="timeline" />
          <TimelineControls
            rangeDays={rangeDays}
            setRangeDays={setRangeDays}
            activeCategories={activeCategories}
            toggleCategory={toggleCategory}
            showAllCategories={showAllCategories}
            query={query}
            setQuery={setQuery}
            resultCount={filteredEvents.length}
          />
          <Timeline
            events={filteredEvents}
            selectedEventId={selectedEvent.id}
            onSelect={(id) => {
              setSelectedEventId(id);
              setIsDetailOpen(true);
            }}
            visibleCategories={visibleCategories}
            rangeDays={rangeDays}
            start={timelineStart}
            ticks={monthTicks}
            yearSegments={yearSegments}
          />
        </section>

        <TrendSection isOpen={isTrendsOpen} onToggle={() => setIsTrendsOpen((value) => !value)} />
      </div>

      <DetailDrawer event={selectedEvent} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
    </main>
  );
}

function PatientHeader() {
  return (
    <header className="border-b border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-2 py-2">
        <div className="relative h-10 w-[154px] shrink-0 overflow-hidden" aria-label="xHealth">
          <img src="/xhealth-group-logo.jpeg" alt="xHealth" className="absolute -left-1.5 -top-[58px] h-[160px] w-[160px] max-w-none object-contain" />
        </div>
        <ProviderUtilities />
      </div>

      <div className="bg-white px-4 py-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-normal text-slate-950">{patient.name}</h1>
              <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-red-800">
                {patient.riskLevel} Risk
              </span>
              {patient.conditions.map((condition) => (
                <ConditionChip key={condition} condition={condition} />
              ))}
            </div>
            <p className="mt-0.5 text-sm text-clinical-muted">
              {patient.age} years old · {patient.sex} · {patient.insurance}
            </p>
          </div>

          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-3 xl:min-w-[680px]">
            <HeaderMetric label="Last visit" value={patient.lastVisit} />
            <HeaderMetric label="Recent acute care" value={patient.recentAcuteCount} />
            <HeaderMetric label="Today's focus" value="Possible CHF worsening" urgent />
          </div>
        </div>
      </div>
    </header>
  );
}

function ProviderUtilities() {
  const [isOpen, setIsOpen] = useState(false);
  const [physician, setPhysician] = useState('Dr. Sarah Patel');
  const physicians = ['Dr. Sarah Patel', 'Dr. Michael Chen', 'Dr. Priya Nair'];

  return (
    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 border-r border-slate-300 pr-3 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <RefreshIcon className="h-3.5 w-3.5 text-slate-500" />
        <span>Refresh</span>
        <span className="font-medium text-slate-500">Last synced 4 hours ago</span>
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-slate-950"
        >
          <span>{physician}</span>
          <ChevronDownIcon className="h-3.5 w-3.5 text-slate-500" />
        </button>
        {isOpen ? (
          <div className="absolute right-0 top-full z-[80] mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
            {physicians.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setPhysician(name);
                  setIsOpen(false);
                }}
                className="w-full rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ConditionChip({ condition }: { condition: string }) {
  return (
    <span className="group relative inline-flex">
      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
        {condition}
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-[70] mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-lg group-hover:block">
        {conditionLabels[condition]}
      </span>
    </span>
  );
}

function ModuleIcon({ category, className }: { category: EventCategory; className?: string }) {
  const baseClass = `h-3.5 w-3.5 shrink-0 ${className ?? ''}`;

  if (category === 'Encounters') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM9 14h6M12 11v6" />
      </svg>
    );
  }

  if (category === 'Medications') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m10.5 20.5 10-10a4.2 4.2 0 0 0-6-6l-10 10a4.2 4.2 0 0 0 6 6ZM8.5 10.5l5 5" />
      </svg>
    );
  }

  if (category === 'Labs & Vitals') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 13h4l2-5 4 10 2-5h4M9 3h6M10 3v5M14 3v5" />
      </svg>
    );
  }

  if (category === 'Care Gaps') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 11l2 2 4-5M5 4h14v16H5zM8 17h8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={baseClass} aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M12 17v4M4.2 6.2 7 9M17 15l2.8 2.8M3 12h4M17 12h4M4.2 17.8 7 15M17 9l2.8-2.8M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 6v5h-5M4 18v-5h5M18.2 9A7 7 0 0 0 6.4 6.7L4 9M5.8 15a7 7 0 0 0 11.8 2.3L20 15" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

function HeaderMetric({ label, value, urgent = false }: { label: string; value: string; urgent?: boolean }) {
  return (
    <div className={`border-l-2 pl-3 ${urgent ? 'border-red-300' : 'border-slate-300'}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-clinical-muted">{label}</div>
      <div className={`mt-0.5 text-sm font-semibold leading-5 ${urgent ? 'text-red-900' : 'text-slate-900'}`}>{value}</div>
    </div>
  );
}

type SectionIconName = 'brief' | 'timeline' | 'trends';

function SectionBar({ title, icon, isOpen, onToggle }: { title: string; icon: SectionIconName; isOpen?: boolean; onToggle?: () => void }) {
  const label = (
    <span className="inline-flex items-center gap-2">
      <SectionIcon icon={icon} />
      <span>{title}</span>
    </span>
  );

  if (onToggle) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between border-b border-slate-300 bg-slate-200 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-300/70"
      >
        {label}
        <ChevronDownIcon className={`h-4 w-4 text-slate-600 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    );
  }

  return (
    <div className="border-b border-slate-300 bg-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
      {label}
    </div>
  );
}

function SectionIcon({ icon }: { icon: SectionIconName }) {
  const className = 'h-3.5 w-3.5 shrink-0 text-slate-700';

  if (icon === 'brief') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 4h6l1 2h3v15H5V6h3l1-2ZM9 12l2 2 4-5M8 18h8" />
      </svg>
    );
  }

  if (icon === 'timeline') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h4M4 12h10M4 18h16M10 6h10M16 12h4M8 6v12" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 19V5M4 19h16M7 15l4-4 3 3 5-7" />
    </svg>
  );
}

function TimelineControls({
  rangeDays,
  setRangeDays,
  activeCategories,
  toggleCategory,
  showAllCategories,
  query,
  setQuery,
  resultCount
}: {
  rangeDays: number;
  setRangeDays: (days: number) => void;
  activeCategories: Set<EventCategory>;
  toggleCategory: (category: EventCategory) => void;
  showAllCategories: () => void;
  query: string;
  setQuery: (query: string) => void;
  resultCount: number;
}) {
  const isAllActive = activeCategories.size === categories.length;

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{resultCount} events</span>
          </div>
          <p className="mt-1 max-w-[980px] text-xs leading-5 text-clinical-muted">
            Pre-visit focus: Mar-Apr deterioration cluster suggests possible CHF worsening; review volume status, medication adherence, and follow-up gaps.
          </p>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            {timeRanges.map((range) => (
              <button
                key={range.label}
                type="button"
                onClick={() => setRangeDays(range.days)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  rangeDays === range.days ? 'bg-white text-clinical-blue shadow-sm' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events, sources, evidence"
            className="h-9 min-w-[270px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-blue-100 transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4"
          />
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={showAllCategories}
            className={`inline-flex cursor-pointer items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
              isAllActive
                ? 'border-slate-400 bg-slate-100 text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-slate-200'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                activeCategories.has(category)
                  ? `${categoryStyles[category]} shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:brightness-95`
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <ModuleIcon category={category} className={activeCategories.has(category) ? laneAccent[category] : 'text-slate-400'} />
              {category}
            </button>
          ))}
        </div>
        <div className="ml-auto whitespace-nowrap text-right text-[11px] font-medium leading-5 text-slate-500">
          no badge = low/moderate&nbsp;&nbsp; ⚠ high&nbsp;&nbsp; ❗ critical
        </div>
      </div>
    </div>
  );
}

function Timeline({
  events,
  selectedEventId,
  onSelect,
  visibleCategories,
  rangeDays,
  start,
  ticks,
  yearSegments
}: {
  events: TimelineEvent[];
  selectedEventId: string;
  onSelect: (id: string) => void;
  visibleCategories: EventCategory[];
  rangeDays: number;
  start: Date;
  ticks: { label: string; position: number }[];
  yearSegments: { year: number; left: number; width: number }[];
}) {
  const laneHeight = 86;
  const [hoveredEvent, setHoveredEvent] = useState<{ event: TimelineEvent; x: number; y: number } | null>(null);

  return (
    <div className="overflow-x-auto bg-white px-4 pb-5 pt-3">
      <div className={rangeDays === 365 ? 'min-w-[1080px]' : 'min-w-[760px]'}>
        <div className="ml-[132px] h-16 border-b border-slate-200">
          <div className="relative h-full">
            {yearSegments.map((segment) => (
              <div
                key={segment.year}
                className="absolute top-0 h-6 border-l border-slate-200 bg-slate-100/70 px-2 text-xs font-semibold text-slate-600 first:border-l-0"
                style={{ left: `${segment.left}%`, width: `${segment.width}%` }}
              >
                {segment.year}
              </div>
            ))}
            {ticks.map((tick) => (
              <div key={`${tick.label}-${tick.position}`} className="absolute top-7 h-9" style={{ left: `${tick.position}%` }}>
                <div className="h-3 border-l border-slate-200" />
                <div className="-translate-x-1/2 text-xs font-medium text-slate-500">{tick.label}</div>
              </div>
            ))}
          </div>
        </div>

        {visibleCategories.length === 0 ? (
          <EmptyState />
        ) : (
          visibleCategories.map((category) => {
            const laneEvents = events.filter((event) => event.category === category && !hiddenTimelineMarkerIds.has(event.id));
            return (
              <div key={category} className={`grid grid-cols-[132px_1fr] border-b border-slate-100 last:border-b-0 ${laneBands[category]}`} style={{ minHeight: laneHeight }}>
                <div className="flex items-center gap-2 pr-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <ModuleIcon category={category} className={laneAccent[category]} />
                  {category}
                </div>
                <div className="relative min-h-[86px]">
                  <div className="absolute left-0 right-0 top-1/2 border-t border-slate-200" />
                  {ticks.map((tick) => (
                    <div key={`${category}-${tick.label}`} className="absolute bottom-0 top-0 border-l border-slate-100" style={{ left: `${tick.position}%` }} />
                  ))}
                  {laneEvents.map((event, index) => {
                    const left = getEventPosition(event.date, start, rangeDays);
                    const top = 15 + (index % 2) * 34;
                    const isPriority = event.id === 'chf-worsening';
                    const showLabel = isPriority || selectedEventId === event.id || event.severity === 'critical' || labeledEventIds.has(event.id);
                    const markerLabel = shortEventLabels[event.id] ?? event.title;
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onSelect(event.id)}
                        onMouseEnter={(mouseEvent) => {
                          const rect = mouseEvent.currentTarget.getBoundingClientRect();
                          setHoveredEvent({ event, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
                        }}
                        onMouseLeave={() => setHoveredEvent(null)}
                        className={`group absolute z-10 flex min-h-7 items-center gap-1.5 rounded-full border text-left text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm ${
                          showLabel ? 'px-2.5 py-1.5 pr-4' : 'h-5 w-5 justify-center p-0'
                        } ${selectedEventId === event.id ? 'ring-2 ring-slate-300' : ''} ${eventCategoryStyles[event.category]}`}
                        style={{ left: `calc(${left}% - ${showLabel ? 46 : 10}px)`, top }}
                        aria-label={`${event.title}, ${formatDate(event.date)}`}
                      >
                        <span className={`block h-2.5 w-2.5 shrink-0 rounded-full ${eventDotStyles[event.category]}`} />
                        {showLabel ? <span className="whitespace-nowrap">{markerLabel}</span> : null}
                        {showLabel ? <SeverityBadge severity={event.severity} /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
        <EventPreview hoveredEvent={hoveredEvent} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="ml-[132px] flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
      No events match the current filters.
    </div>
  );
}

function EventPreview({ hoveredEvent }: { hoveredEvent: { event: TimelineEvent; x: number; y: number } | null }) {
  if (!hoveredEvent) return null;

  const { event, x, y } = hoveredEvent;
  const left = typeof window === 'undefined' ? x : Math.min(Math.max(x, 170), window.innerWidth - 170);
  const top = typeof window === 'undefined' ? y : Math.min(y, window.innerHeight - 330);
  const interpretation = (event.interpretation ?? compactSentences(event.whyItMatters)).slice(0, 2);
  const actions = (event.actions ?? compactSentences(event.suggestedAction)).slice(0, 2);

  return (
    <div
      className="pointer-events-none fixed z-[60] w-[320px] -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs text-slate-700 shadow-lg"
      style={{ left, top }}
    >
      <PreviewBlock title="Event details">
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-950">{event.title}</div>
          <div>{formatDate(event.date)}</div>
          <div className="capitalize">
            {event.severity} · {event.category}
          </div>
        </div>
      </PreviewBlock>
      <PreviewBlock title="Source">
        <div>{event.source}</div>
      </PreviewBlock>
      <PreviewBlock title="Key evidence">
        <PreviewList items={event.evidence.slice(0, 3)} />
      </PreviewBlock>
      <PreviewBlock title="Clinical interpretation">
        <PreviewList items={interpretation} />
      </PreviewBlock>
      <PreviewBlock title="Next action">
        <PreviewList items={actions} />
      </PreviewBlock>
    </div>
  );
}

function PreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-2 last:mb-0">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      {children}
    </section>
  );
}

function PreviewList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item} className="flex gap-1.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SeverityBadge({ severity, inline = false }: { severity: Severity; inline?: boolean }) {
  if (severity !== 'high' && severity !== 'critical') return null;

  const label = severity === 'high' ? 'High severity' : 'Critical severity';
  const symbol = severity === 'high' ? '⚠' : '!';
  const classes =
    severity === 'high'
      ? 'border-amber-300 bg-amber-100 text-amber-800'
      : 'border-red-300 bg-red-100 text-red-800';

  return (
    <span
      aria-label={label}
      className={`${inline ? 'relative' : 'absolute -right-1 -top-1'} inline-flex h-4 min-w-4 items-center justify-center rounded-full border px-1 text-[10px] font-bold leading-none ${classes}`}
    >
      {symbol}
    </span>
  );
}

function PreVisitBrief() {
  const blocks: { title: string; items: string[]; tone: string }[] = [
    {
      title: 'Why attention today',
      items: ['+7 lb since discharge', 'Dyspnea on stairs', 'BNP 690', 'Diuretic adherence issue'],
      tone: 'border-red-200 bg-red-50'
    },
    {
      title: 'Recent changes',
      items: ['Weight up', 'BNP up', 'A1c overdue', 'Cardiology follow-up missed'],
      tone: 'border-orange-200 bg-orange-50'
    },
    {
      title: 'Top risks',
      items: ['CHF decompensation', 'Preventable ED visit', 'CKD progression', 'Diabetes control worsening'],
      tone: 'border-slate-200 bg-slate-50'
    },
    {
      title: 'Suggested actions',
      items: ['Assess volume status', 'Reconcile furosemide', 'Order BMP/BNP', 'Arrange 48h follow-up'],
      tone: 'border-blue-200 bg-blue-50'
    }
  ];

  return (
    <section className="border-b border-slate-200">
      <SectionBar title="Pre-Visit Brief" icon="brief" />
      <div className="grid md:grid-cols-2 xl:grid-cols-4">
        {blocks.map((block) => (
          <div key={block.title} className={`border-b border-r border-slate-200 px-4 py-3 last:border-r-0 md:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(4n)]:border-r-0 ${block.tone}`}>
            <h3 className="text-sm font-semibold text-slate-950">{block.title}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {block.items.map((item) => (
                <span key={item} className="rounded-full border border-white/70 bg-white/80 px-2 py-1 text-xs font-medium leading-4 text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetailDrawer({ event, isOpen, onClose }: { event: TimelineEvent; isOpen: boolean; onClose: () => void }) {
  const interpretation = event.interpretation ?? compactSentences(event.whyItMatters);
  const actions = event.actions ?? compactSentences(event.suggestedAction);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <button
        type="button"
        aria-label="Close event details"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/10 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-[430px] overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-xl transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-clinical-muted">Event details</p>
            <h2 className="mt-1.5 text-lg font-semibold leading-6 text-slate-950">{event.title}</h2>
            <p className="mt-1 text-sm text-clinical-muted">{formatDate(event.date)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-2 text-sm">
          <PanelBlock title="Event details" compact>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${severityStyles[event.severity]}`}>{event.severity}</span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${categoryStyles[event.category]}`}>{event.category}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">{formatDate(event.date)}</span>
            </div>
          </PanelBlock>
          <PanelBlock title="Source" compact>
            <p>{event.source}</p>
          </PanelBlock>
        </div>

        <PanelBlock title="Key evidence">
          <CompactList items={event.evidence} />
        </PanelBlock>
        <PanelBlock title="Clinical interpretation">
          <CompactList items={interpretation} />
        </PanelBlock>
        <PanelBlock title="Next action">
          <CompactList items={actions} />
        </PanelBlock>
      </aside>
    </div>
  );
}

function PanelBlock({ title, children, compact = false }: { title: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <section className={`${compact ? 'mt-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5' : 'mt-4 border-t border-slate-100 pt-3'}`}>
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-2 text-sm leading-5 text-slate-700">{children}</div>
    </section>
  );
}

function CompactList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clinical-blue" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TrendSection({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <section>
      <SectionBar title="Trend Signals" icon="trends" isOpen={isOpen} onToggle={onToggle} />
      <div className={`grid overflow-hidden transition-[max-height,opacity] duration-200 ease-out md:grid-cols-2 xl:grid-cols-4 ${isOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {trends.map((trend) => (
          <TrendCard key={trend.title} trend={trend} />
        ))}
      </div>
    </section>
  );
}

function TrendCard({ trend }: { trend: Trend }) {
  const latest = trend.points[trend.points.length - 1];
  const stroke = trend.tone === 'risk' ? '#dc2626' : trend.tone === 'watch' ? '#d97706' : '#15803d';

  return (
    <article className="border-b border-r border-slate-200 bg-white p-4 last:border-r-0 md:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(4n)]:border-r-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{trend.title}</h3>
          <p className="mt-0.5 text-xs font-medium leading-4 text-clinical-muted">{trend.status}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold leading-5 text-slate-950">
            {latest.value}
            <span className="ml-1 text-xs font-medium text-clinical-muted">{trend.unit}</span>
          </div>
        </div>
      </div>
      <Sparkline trend={trend} stroke={stroke} />
    </article>
  );
}

function Sparkline({ trend, stroke }: { trend: Trend; stroke: string }) {
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number } | null>(null);
  const width = 260;
  const height = 92;
  const paddingX = 12;
  const topPadding = 8;
  const chartBottom = 58;
  const values = trend.points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const plottedPoints = trend.points.map((point, index) => {
      const x = paddingX + (index / Math.max(trend.points.length - 1, 1)) * (width - paddingX * 2);
      const y = chartBottom - ((point.value - min) / span) * (chartBottom - topPadding);
      return { point, x, y };
    });
  const points = plottedPoints.map(({ x, y }) => `${x},${y}`).join(' ');

  return (
    <div className="relative mt-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full" role="img" aria-label={`${trend.title} trend`} onMouseLeave={() => setHoveredPoint(null)}>
        <line x1={paddingX} x2={width - paddingX} y1={chartBottom} y2={chartBottom} stroke="#d9e2ef" strokeWidth="2" />
        <polyline points={points} fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {plottedPoints.map(({ point, x, y }, index) => {
          const isHovered = hoveredPoint?.index === index;
          return (
            <g
              key={`${point.date}-${point.value}`}
              onMouseEnter={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setHoveredPoint({ index, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
              }}
              className="cursor-pointer"
            >
              <circle cx={x} cy={y} r={isHovered ? '7' : '4'} fill={isHovered ? '#ffffff' : 'white'} stroke={stroke} strokeWidth={isHovered ? '4' : '3'} />
              <circle cx={x} cy={y} r="11" fill="transparent" />
              <text x={x} y={82} textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">
                {formatTrendTick(point.date)}
              </text>
            </g>
          );
        })}
      </svg>
      {hoveredPoint ? (
        <TrendTooltip
          trend={trend}
          pointIndex={hoveredPoint.index}
          anchorX={hoveredPoint.x}
          anchorY={hoveredPoint.y}
        />
      ) : null}
    </div>
  );
}

function TrendTooltip({
  trend,
  pointIndex,
  anchorX,
  anchorY
}: {
  trend: Trend;
  pointIndex: number;
  anchorX: number;
  anchorY: number;
}) {
  const point = trend.points[pointIndex];
  const previous = pointIndex > 0 ? trend.points[pointIndex - 1] : null;
  const delta = previous ? point.value - previous.value : null;
  const tooltipWidth = 176;
  const tooltipHeight = previous ? 126 : 104;
  const margin = 10;
  const gap = 12;
  const viewportWidth = typeof window === 'undefined' ? 1024 : window.innerWidth;
  const viewportHeight = typeof window === 'undefined' ? 768 : window.innerHeight;
  const left = clamp(anchorX - tooltipWidth / 2, margin, viewportWidth - tooltipWidth - margin);
  const hasSpaceAbove = anchorY - tooltipHeight - gap >= margin;
  const top = hasSpaceAbove
    ? anchorY - tooltipHeight - gap
    : clamp(anchorY + gap, margin, viewportHeight - tooltipHeight - margin);

  const tooltip = (
    <div
      className="pointer-events-none fixed z-[90] w-44 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg"
      style={{ left, top }}
    >
      <div className="font-semibold text-slate-950">{trend.title}</div>
      <div className="mt-0.5 text-slate-500">{formatDate(point.date)}</div>
      <div className="mt-1 font-semibold text-slate-900">{formatTrendValue(point.value, trend.unit)}</div>
      {previous ? (
        <>
          <div className="mt-1 text-slate-600">
            {formatTrendValue(previous.value, trend.unit)} → {formatTrendValue(point.value, trend.unit)}
          </div>
          <div className={`mt-0.5 font-semibold ${delta && delta > 0 ? 'text-red-700' : delta && delta < 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
            {formatTrendDelta(delta ?? 0, trend.unit)} since previous
          </div>
        </>
      ) : (
        <div className="mt-1 text-slate-600">First recorded point</div>
      )}
    </div>
  );

  return createPortal(tooltip, document.body);
}

function getEventPosition(date: string, start: Date, rangeDays: number) {
  const eventDate = new Date(`${date}T12:00:00`);
  const elapsed = daysBetween(start, eventDate);
  return Math.min(97, Math.max(3, (elapsed / rangeDays) * 100));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function compactSentences(text: string) {
  return text
    .split(/[.;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function buildTicks(start: Date, end: Date) {
  const ticks: { label: string; position: number }[] = [];
  const cursor = new Date(start);
  cursor.setDate(1);
  cursor.setMonth(cursor.getMonth() + 1);
  const total = Math.max(daysBetween(start, end), 1);

  while (cursor <= end) {
    ticks.push({
      label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(cursor),
      position: (daysBetween(start, cursor) / total) * 100
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return ticks;
}

function buildYearSegments(start: Date, end: Date) {
  const total = Math.max(daysBetween(start, end), 1);
  const segments: { year: number; left: number; width: number }[] = [];
  let year = start.getFullYear();

  while (year <= end.getFullYear()) {
    const segmentStart = year === start.getFullYear() ? start : new Date(`${year}-01-01T12:00:00`);
    const segmentEnd = year === end.getFullYear() ? end : new Date(`${year}-12-31T12:00:00`);
    const left = Math.max(0, (daysBetween(start, segmentStart) / total) * 100);
    const width = Math.max(4, (daysBetween(segmentStart, segmentEnd) / total) * 100);
    segments.push({ year, left, width });
    year += 1;
  }

  return segments;
}

export default App;

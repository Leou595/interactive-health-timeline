# Design Note

## 1. Objective

The goal was to design a simplified interactive visualization that helps a physician quickly understand an older adult patient's longitudinal clinical history. The interface organizes complex, multi-source clinical information into a rapid pre-visit review flow without attempting to diagnose or replace physician judgment.

The interface is designed to support rapid pre-visit orientation: helping a physician quickly understand who the patient is, what changed recently, what risks are emerging, and what may need attention during today's visit.

## 2. Key Assumptions and Product Context: Older Adult Care

This prototype is designed in the broader context of care for adults aged 65+, and uses a high-risk Medicare Advantage patient as a representative complex scenario.

This timeline visualization is especially valuable in older adult care because physicians often need to reconstruct a story across multimorbidity, chronic disease burden, fragmented care settings, medications and adherence, care gaps, post-discharge vulnerability, and preventable ED or hospitalization risk. I reflected these challenges in the mock case through an older adult patient scenario with multiple chronic conditions, recent ED/hospital use, missed cardiology follow-up, medication reconciliation concern, worsening labs/vitals, and Clinical Signals tied to supporting evidence.

## 3. Case Design

The mock patient is Maria Thompson, an older Medicare Advantage patient with CHF, type 2 diabetes, CKD stage 3, and hypertension.

This scenario creates a clinically plausible longitudinal story. Maria has multiple chronic conditions, prior acute care, medication complexity, missed follow-up, and a recent Mar-Apr deterioration cluster. That cluster creates a clear clinical question: is CHF worsening, and can outpatient action reduce preventable acute-care risk?

The scenario lets the physician move from summary, to timeline evidence, to event detail, to next action.

## 4. Data Modeling Approach

Events are modeled across five categories:

- Encounters
- Medications
- Labs & Vitals
- Care Gaps
- Clinical Signals

Each event includes fields such as date, category, title or short label, severity, source, evidence, clinical interpretation, suggested action, and related context where applicable.

Clinical Signals are not raw observations. They are synthesized risk signals derived from supporting events such as labs, vitals, medication history, care gaps, and care notes.

## 5. Information Architecture

The patient header provides identity, demographics, risk status, coverage context, recent acute care, and today's focus.

The Pre-Visit Brief gives the clinical takeaway first: why attention is needed today, what changed recently, top risks, and suggested actions. In a future AI-assisted workflow, this brief could be generated or refreshed from updated longitudinal data, with the physician still reviewing the evidence.

The Interactive Health Timeline acts as the chronological evidence layer. It shows when events occurred and how symptoms, labs, medications, care gaps, and Clinical Signals cluster over time.

Hover previews support quick inspection without forcing extra clicks. Click detail supports deeper review of source, evidence, interpretation, and next action.

Trend Signals provide quantitative context for chronic disease monitoring.

## 6. Rapid Clinical Scanability

The design supports fast review by putting the conclusion first and evidence second. The Pre-Visit Brief orients the physician quickly, while the timeline explains when and where those signals emerged.

Scanability choices include:

- labels only for high-priority or actionable events
- compact markers for supporting context
- filters by clinical category
- hover previews for quick inspection
- click-to-drill-down details
- trend point tooltips for exact values and changes

## 7. Visual Encoding Tradeoffs

Not every event is labeled. Labeling every event would create visual noise and make the timeline harder to scan. Visible labels are reserved for recent, high-priority, or actionable findings. Lower-priority context events remain compact markers.

Category is encoded by lane position, lane icon, event color family, and the small colored dot on event pills. Severity is encoded separately through badges so category color is not confused with risk severity.

Severity encoding:

- no badge = low/moderate
- warning triangle = high
- red exclamation = critical

## 8. Trend Metric Selection

Weight supports CHF and fluid status monitoring. A1c reflects diabetes control. eGFR reflects CKD progression. Blood Pressure reflects cardiovascular risk across CHF, CKD, and hypertension.

BNP is shown as a timeline event rather than a trend chart because, in this mock dataset, it is a recent high-signal lab within the deterioration cluster, not a repeated longitudinal metric.

## 9. AI / Agent Alignment

This design can align with an AI-enabled senior care workflow without becoming a chatbot UI. Clinical Signals could be generated by an AI layer from updated longitudinal data. The Pre-Visit Brief could summarize the most relevant patient changes. Suggested actions could support best-next-action workflows.

The interface keeps the physician in control by showing sources, evidence, clinical interpretation, and suggested actions in context.

## 10. Scope Boundaries

This is not a full EHR, population dashboard, standalone diagnostic system, or production agent. It is a focused physician-facing timeline prototype using synthetic data.

## 11. Product Value Proxies

North Star metrics are not shown in the physician UI. For this prototype, useful evaluation criteria are:

- faster pre-visit review
- actionable risk signal surfacing
- care-gap identification
- focus on preventable acute-care risk

These are product-value proxies for evaluating the prototype, not validated real-world outcomes.

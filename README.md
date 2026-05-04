# Interactive Health Timeline

A physician-facing interactive visualization for quickly understanding an older adult patient's longitudinal health history from synthetic clinical data. The demo uses a Medicare Advantage patient example and supports rapid pre-visit review through a clinical timeline, synthesized risk signals, care gaps, and trend views.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Local synthetic mock data

## How To Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal, usually:

```bash
http://localhost:5173/
```

## How To Build

```bash
npm run build
```

## How To Use The Demo

### Patient Header

The header shows patient identity, risk status, demographics, coverage context, recent acute care, last visit, and today's focus. Hover the condition chips to see full condition names.

### Pre-Visit Brief

The brief gives a compact clinical takeaway before inspecting the timeline. It highlights why the patient needs attention, what changed recently, top risks, and suggested actions.

### Interactive Health Timeline

The timeline shows events across time and clinical lanes:

- Encounters
- Medications
- Labs & Vitals
- Care Gaps
- Clinical Signals

Use the category chips to filter events. The `All` chip restores the full view. The year/month axis provides chronological context. Labeled events indicate high-priority or actionable findings, while compact markers preserve supporting longitudinal context.

Hover over a timeline event for a quick preview. Click an event to open the detailed right-side panel with source, evidence, interpretation, and suggested action.

Severity badges:

- no badge = low/moderate
- warning triangle = high
- red exclamation = critical

### Trend Signals

Trend Signals show Weight, A1c, eGFR, and Blood Pressure. Hover over a trend point to see the exact date, value, previous value, and change from the prior point.

## Data Note

All data is synthetic. No real patient data is used. The app has no backend and makes no external API calls. The local dataset is only intended to demonstrate the data model and UI behavior.

## File Guide

- `src/` contains the React app.
- `public/` contains static assets.
- `DESIGN_NOTE.md` explains the design approach and tradeoffs.

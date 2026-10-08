# AuditTrail — Event-Sourced Inventory & Logistics Ledger

> **This version is a static demonstration and uses mock services instead of a live database/backend.**

AuditTrail shows how an event-sourced ledger works for regulated logistics. Instead of overwriting a shipment record, every change is appended as an immutable, versioned event. The current state of a shipment, or its state at any past moment, is rebuilt by replaying those events.

## Features

- **Dashboard**: shipment, event and exception totals, activity and status charts, recent events, active exceptions, system health.
- **Shipments**: searchable, filterable, sortable, paginated table backed by a read model.
- **Shipment detail**: event-sourced timeline, sensor chart with expected range, optimistic concurrency demo, event store integrity card with a hash chain.
- **Timeline (state reconstruction)**: a scrubber that replays events up to any point and shows the reconstructed state, plus CRUD-vs-event-sourcing and CQRS diagrams.
- **Audit logs**: filter by search, date, status, event type and actor; click a row for a detail drawer with payload, previous state and resulting state.
- **Reports**: six reports generated in the browser, viewable and downloadable as CSV or JSON.
- **Analytics**: 7, 30 and 90 day views of event volume, temperature, exceptions, status and event types.
- **Settings**: light/dark theme, notification preferences and account details saved to `localStorage`.
- Global search, collapsible sidebar (drawer on mobile), toasts, skeleton loaders, empty states and error states with retry.

## Tech stack

React 18, TypeScript (strict), Vite, Tailwind CSS, React Router, Recharts, Lucide React.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # type-checks, then outputs static files to dist/
npm run preview    # serve the production build locally
npm run lint
```

## Demo credentials

| Email | Password |
| --- | --- |
| `demo@audittrail.com` | `password123` |

There is no real authentication. Any valid-looking email with a password of 6 or more characters signs in, and **Continue as Demo User** skips the form.

## Deploy

The build output (`dist/`) is plain static files. SPA routing is configured so refreshing `/dashboard`, `/shipments`, `/timeline`, `/audit-logs`, `/reports`, `/analytics` or `/settings` does not return a 404.

### Vercel

1. Push the project to a Git repository (or use the Vercel CLI).
2. In Vercel choose **Add New → Project** and import the repository.
3. Keep the detected settings: framework **Vite**, build command `npm run build`, output directory `dist`. `vercel.json` already contains the SPA rewrite.
4. Click **Deploy**. No environment variables are required.

### Netlify

1. Push the project to a Git repository.
2. In Netlify choose **Add new site → Import an existing project**.
3. Build command `npm run build`, publish directory `dist` (also set in `netlify.toml`, which includes the SPA redirect).
4. Click **Deploy site**. For a manual deploy, run `npm run build` and drag the `dist` folder into Netlify.

### GitHub Pages or other static hosts

Upload `dist/`. If the host cannot rewrite unknown paths to `index.html`, enable its "single page app" or 404-fallback option.

## Architecture

```
src/
  components/   reusable UI (ui/, charts/), event cards, diagrams, OCC demo
  context/      settings (theme + localStorage), demo auth session, toasts
  data/         seeded mock datasets: shipments + events, sensors, audit logs, metrics, reports
  hooks/        useAsync, useDebounce, useFocusTrap, usePageTitle, useChartTheme
  layouts/      app shell: sidebar and header
  pages/        one component per route
  services/     mockApi.ts: Promise-based service layer
  types/        shared TypeScript types
  utils/        formatting, constants, event reducer, hashing, downloads, seeded PRNG
```

### Static architecture

There is no server, database or environment variable. `src/services/mockApi.ts` exposes the same Promise-based functions a real API client would (`getShipments`, `getShipmentById`, `getShipmentEvents`, `getAuditLogs`, `getSensorData`, `reconstructState`, `getReports`, plus dashboard, analytics and search). Data is generated deterministically from `src/data/`, so every load shows the same records. Replacing the service layer with real HTTP calls would not require changing the pages.

The demo clock is fixed at **18 Sep 2026, 14:34 UTC** so relative times ("2 mins ago") stay consistent with the sample data. In **Settings → System**, *Simulate a failed request* makes the next data call fail once so you can see the error state.

### Event sourcing

State is never stored. Each shipment owns an append-only stream of events (`CONTAINER_CREATED`, `LOADED_ON_SHIP`, `DEPARTED_PORT`, `TEMPERATURE_SPIKE`, `ARRIVED_AT_PORT`, `INSPECTION_STARTED`, `INSPECTION_COMPLETED`, `DELIVERED`). A pure reducer (`src/utils/eventSourcing.ts`) folds events into the current state. Replaying only the first N events gives the state at that moment, which is what the Timeline scrubber does. Each event also stores a hash of the previous one to illustrate tamper evidence.

### CQRS

Commands (append an event) and queries (read a view) are separate. The shipments table and dashboard read from projections derived from the event stream, never from the write path. The Timeline page includes a diagram of this flow.

### Optimistic concurrency control (OCC)

A command carries the version of the stream the caller last saw. If it matches the current version the event is accepted; if another writer got there first, the command is rejected with `409 CONFLICT` and the caller must reload and retry. The shipment detail page simulates this in the browser; nothing is written.

## Screenshots

Add screenshots here after deploying.

| Dashboard | Timeline | Shipment detail |
| --- | --- | --- |
| _placeholder_ | _placeholder_ | _placeholder_ |

## Dataset

15 shipments, 73 events, 39 audit logs, 600+ sensor readings and 6 reports, across ports in India, Singapore, the UAE, the Netherlands, Germany and the United Kingdom. Dashboard totals (1,284 shipments, 8,942 events today) are fleet-wide simulated figures.

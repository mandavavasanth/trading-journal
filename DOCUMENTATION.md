# Discipline Trading Journal

## Project Summary

This application is a trading journal and performance dashboard designed to help traders log trades, review execution quality, and track behavioral patterns. It is structured as a single-page front-end app and is optimized for personal use, analysis, and portfolio reflection.

## Business Purpose

The system supports traders who want to:

- record trades consistently,
- review profitability by asset and date,
- evaluate emotional and execution patterns,
- maintain discipline over time,
- export trade records for analysis or backup.

## Features

### Dashboard

The dashboard shows:

- total capital,
- current balance,
- total P&L,
- win rate,
- best and worst trade,
- monthly performance,
- recent trade activity.

### Calendar View

The calendar view lets users:

- view all trades by day,
- add new trades from each day,
- edit or delete existing trades,
- spot execution patterns across the month.

### Psychology View

The psychology section groups trades by emotional and decision-related tags such as:

- FOMO
- Discipline
- Patience
- Confidence
- Overtrading
- Revenge Trading

This helps identify patterns tied to psychological performance.

### History View

The history view provides a structured record of all trades, including:

- asset,
- date,
- trade direction,
- position size,
- P&L,
- editable entries.

### Analytics View

The analytics view helps users review performance and export records for further offline analysis.

## Front-End Architecture

### Main entry point

`src/main.js` controls the main navigation, route switching, and global event handling.

### State and storage

`src/store.js` owns the application data layer. It:

- reads and writes trades to `localStorage`,
- keeps capital information,
- calculates summary statistics,
- exports backup JSON files.

### Views

Each view is organized under `src/views/`:

- `dashboard.js` - overview metrics and KPI cards
- `calendar.js` - daily execution calendar
- `history.js` - full trade log and edits
- `psychology.js` - behavior-focused tag summaries
- `analytics.js` - reporting and export logic

### Components

`src/components/tradeModal.js` provides the trade creation and edit form. This modal handles validation, P&L calculations, and submission logic.

## Data Model

Each trade record contains information such as:

- ID
- date
- asset
- trade type (Buy/Sell)
- entry and exit prices
- lot size
- P&L
- reason
- notes
- tags

## Local Storage Behavior

The project currently stores data in the browser using `localStorage`.

This means:

- data remains available while the browser is used,
- there is no server-side database,
- backups should be exported periodically,
- data is not automatically synchronized across devices.

## Design Notes

The interface uses a dark trading dashboard theme with neon accents and responsive cards. Tailwind CSS drives the styling system, while Lucide icons provide visual cues for actions and metrics.

## Setup Instructions

```bash
npm install
npm run dev
```

## Build Instructions

```bash
npm run build
```

## GitHub Publishing

1. Create a repository on GitHub.
2. From the project folder, run:

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

3. If GitHub prompts for authentication, complete the login flow.

## Recommended Future Improvements

- add user authentication,
- connect to a real backend and database,
- enable cloud sync,
- add chart visualizations,
- add CSV import,
- support monthly reporting PDF export.

# Discipline Trading Journal

A modern trading journal dashboard for tracking trades, reviewing performance, and analyzing emotional patterns in a disciplined trading workflow.

Live demo: https://mandavavasanth.github.io/trading-journal/
Repository: https://github.com/mandavavasanth/trading-journal

## Overview

This project is a front-end-only trading journal designed for personal accountability and performance tracking. It stores trade data in the browser using localStorage, so it can run without a backend or database.

## Features

- Dashboard with capital, balance, P&L, win rate, and trade extremes
- Calendar-based trade logging and review
- Psychology and emotional-trade tagging
- Trade history table with add, edit, and delete actions
- Analytics reporting and CSV export support
- JSON backup export for local security
- Quick-add floating action button for fast logging

## Tech Stack

- Vite
- JavaScript (ES modules)
- Tailwind CSS
- Lucide icons
- Browser localStorage

## Project Structure

```text
marketing/
├── .github/
│   └── workflows/
│       └── pages.yml
├── index.html
├── package.json
├── README.md
├── DOCUMENTATION.md
├── vite.config.js
├── LICENSE
├── postcss.config.js
├── tailwind.config.js
├── public/
├── src/
│   ├── main.js
│   ├── store.js
│   ├── style.css
│   ├── components/
│   │   └── tradeModal.js
│   └── views/
│       ├── analytics.js
│       ├── calendar.js
│       ├── dashboard.js
│       ├── history.js
│       └── psychology.js
└── .gitignore
```

## Installation

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Production build

```bash
npm run build
```

The build output is generated in the `dist/` folder.

## GitHub Pages deployment

This project is configured for GitHub Pages through GitHub Actions.

After pushing to the `main` branch, the action will publish the site to:

```text
https://mandavavasanth.github.io/trading-journal/
```

## Notes

- This app is browser-based and stores data locally.
- Export backups regularly to avoid losing trade history.
- For multi-device sync or cloud storage, the next step would be adding a backend and database.

## License

This project is licensed under the MIT License.

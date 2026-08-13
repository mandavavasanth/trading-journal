# Discipline Trading Journal

A modern trading journal dashboard built with Vite, Tailwind CSS, and vanilla JavaScript. This app helps traders log trades, review performance, track psychology, and maintain an organized calendar-based execution history.

## Overview

This project is a front-end-only trading journal designed for personal accountability and performance tracking. It stores trade data in the browser using `localStorage`, so it can run without a backend or database.

## Features

- Dashboard overview with capital, balance, P&L, win rate, and trade extremes
- Calendar-based trade logging and review
- Psychology tags for emotional review patterns (FOMO, discipline, patience, revenge trading, etc.)
- Trade history table with search and editing support
- Analytics page with exportable CSV-style reporting
- Backup export of trade data in JSON format
- Floating quick-add trade button for fast logging

## Tech Stack

- Vite
- JavaScript (ES modules)
- Tailwind CSS
- Lucide icons
- Browser localStorage

## Project Structure

```text
marketing/
├── index.html
├── package.json
├── README.md
├── DOCUMENTATION.md
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

## Main Application Flow

- `src/main.js` sets up the navigation and route switching between dashboard, calendar, psychology, history, and analytics.
- `src/store.js` manages trade data and exported backups, and initializes demo data if none is stored yet.
- Each view in `src/views/` renders a specific section of the journal.
- `src/components/tradeModal.js` handles creating and editing individual trades.

## Installation

```bash
npm install
```

## Run the app locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, typically:

```text
http://localhost:5173
```

## Production build

```bash
npm run build
```

The build output is generated in the `dist/` folder.

## GitHub Setup

If you want to push this project to GitHub, use the following commands after creating a repository on GitHub.

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

For a GitHub repo that already exists:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git branch -M main
git push -u origin main
```

## Notes

- This project is a client-side app and does not include authentication or a database.
- Trade data is saved in the browser, so exporting backups regularly is recommended.
- If you want to add a backend later, this app can be extended with a database or API for persistent multi-device access.

## License

This project is for personal or internal use unless otherwise specified by the owner.

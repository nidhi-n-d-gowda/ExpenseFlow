# Nidhi's ExpenseFlow

A React + Vite personal expense tracker with localStorage persistence, editable expense/category management, dashboard charts, CSV export (Excel-compatible), and PDF export.

## Run in VS Code
1. Install Node.js LTS from https://nodejs.org (if not installed).
2. Extract this ZIP and open the `nidhi-expenseflow` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the URL Vite prints (usually `http://localhost:5173`).

## Files
- `src/App.jsx` — pages, expense/category CRUD, charts and export logic
- `src/styles.css` — responsive theme, animations and layout
- `src/main.jsx` — React entry point
- `package.json` — dependencies and scripts

## Notes
- Expenses/categories are stored in this browser's localStorage. This is a frontend demo; data is not synced between devices.
- CSV downloads can be opened in Microsoft Excel. PDF downloads as a report.
- Dashboard uses sample data initially. Add or delete records to customize it.

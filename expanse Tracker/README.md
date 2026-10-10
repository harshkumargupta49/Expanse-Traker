# Personal Expense Tracker 💰

A modern, responsive, and feature-rich **Personal Expense Tracker** web application built with **HTML5, CSS3, Vanilla JavaScript, and Bootstrap 5**, featuring interactive visual progress components, cash flow ratio meters, and `localStorage` for data persistence.

---

## 📁 Project Folder Structure

```
expanse-tracker/
│
├── index.html          # Main HTML5 structure, metadata, Bootstrap 5 CDN, modals, and templates
├── css/
│   └── style.css       # Design system, light theme aesthetics, dark theme, Bootstrap overrides
├── js/
│   └── script.js       # Core application logic (State, localStorage, CRUD, Bootstrap analytics, Filters, CSV export)
├── vercel.json         # Vercel configuration for static routing and security headers
├── package.json        # Project metadata and start scripts
└── README.md           # Documentation, setup guide, and technical explanations
```

---

## 🚀 How to Run the Application Locally

Since this application is built using pure **Vanilla HTML, CSS, JavaScript, and Bootstrap 5 via CDN**, no build tools or package managers are required!

### Option 1: Direct File Opening
1. Double-click or open `index.html` in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari).

### Option 2: Live Server (VS Code Extension)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension.
3. Right-click on `index.html` and select **"Open with Live Server"**.
4. The app will launch automatically at `http://127.0.0.1:5500`.

---

## 🎨 Enhanced Light Theme & Bootstrap Visualizations

### 1. Attractive Light Theme Aesthetics
- **Soft Ambient Canvas**: Light subtle background gradient with soft ambient hues.
- **Modern Fintech Card Styling**: Clean white cards with gentle drop shadows, rounded corners, and subtle borders.
- **Lush Status Accents**: Emerald green (`#059669`) for Income, Rose coral (`#e11d48`) for Expenses, and Royal Indigo (`#4f46e5`) for Balance.
- **Refined Badges & Buttons**: Pastel pill badges and gradient hover states.

### 2. Bootstrap Analytics Components (Replaced Chart.js)
- **Expense Category Distribution**: Interactive Bootstrap progress bars for each active expense category with colored indicator dots, category icons, percentage badges, and formatted amounts.
- **Income vs Expense Ratio Meter**: Dual stacked Bootstrap progress bar (`progress-stacked`) with animated striped bars showing the exact percentage split between Inflow and Outflow, plus an automated Savings Rate calculation.
- **Monthly Spending Trajectory Overview**: Responsive month-by-month cards with progress meters comparing expenses relative to peak spending months.

---

## ⚙️ Core JavaScript Functions Explained (Beginner-Friendly)

### 1. `loadTransactions()` & `saveTransactions()`
* **`loadTransactions()`**: Checks `localStorage` for saved records. Parses stored JSON strings into JavaScript objects. If no data exists on first load, populates realistic demo transactions.
* **`saveTransactions()`**: Converts `state.transactions` into a JSON string using `JSON.stringify()` and stores it safely in `localStorage`.

### 2. `calculateSummary(txList)`
* Iterates over transactions to compute Total Income, Total Expenses, Balance (`Income - Expenses`), highest spending category, and current month's spending.

### 3. `formatCurrency(amount)`
* Formats values into Indian Rupees (**₹**) with Indian comma grouping via `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.

### 4. `openTransactionModal(txToEdit)` & `handleFormSubmit(e)`
* **`openTransactionModal()`**: Opens form dialog pre-filled when editing or reset for adding new items.
* **`handleFormSubmit()`**: Validates input fields and saves item without creating duplicate entries.

### 5. `filterTransactions()` & `getFilteredTransactions()`
* Dynamically filters transaction items by search text, category, type (Income/Expense), and start/end dates.

### 6. `updateAnalyticsWidgets(filteredTx)`
* Calculates dynamic category distributions, Cashflow ratios, and monthly spending totals, rendering them using Bootstrap progress bars and cards.

### 7. `exportToCSV()`
* Generates a CSV data file from current active transactions and triggers instant browser download.

---

## 💾 How `localStorage` Works in This Project

1. **Saving Data**:
   ```javascript
   localStorage.setItem('expanse_tracker_transactions', JSON.stringify(state.transactions));
   ```
   Converts JavaScript objects to text strings for local persistence.

2. **Retrieving Data**:
   ```javascript
   const transactions = JSON.parse(localStorage.getItem('expanse_tracker_transactions'));
   ```
   Converts stored text strings back into JavaScript objects when reloading the browser.

---

## ✨ Features Checklist

- [x] Modern Dashboard Layout & Attractive Light Theme
- [x] Responsive layout for Desktop, Tablet, and Mobile
- [x] Light / Dark Mode Toggle (with persistent localStorage preference)
- [x] **Balance Loss Prevention Guard**: Prevents expenses or income deletions that would cause a negative balance (`Balance < ₹0.00`)
- [x] Dynamic Summary Cards (Total Income, Total Expenses, Balance in ₹)
- [x] Transaction Management (Add, Edit, Delete with Confirmation Modal)
- [x] Real-time Multi-Criteria Search & Filtering
- [x] **Bootstrap 5 Analytical Components** (Category Progress Bars, Cash Flow Stacked Meter, Monthly Trajectory Cards)
- [x] Local Storage Data Persistence
- [x] CSV Data Exporting
- [x] Toast Notifications for user actions

---

## 📝 License
This project is open-source under the MIT License.

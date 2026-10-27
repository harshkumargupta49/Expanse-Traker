
document.addEventListener('DOMContentLoaded', () => {

  // 1. Constants & Application State
  const STORAGE_KEY_TRANSACTIONS = 'expanse_tracker_transactions';
  const STORAGE_KEY_THEME = 'expanse_tracker_theme';

  // Category Configuration
  const CATEGORIES = {
    income: [
      { id: 'Salary', name: 'Salary', icon: 'fa-briefcase' },
      { id: 'Freelancing', name: 'Freelancing', icon: 'fa-laptop-code' },
      { id: 'Business', name: 'Business', icon: 'fa-building-columns' },
      { id: 'Investment', name: 'Investment', icon: 'fa-chart-line' },
      { id: 'Other Income', name: 'Other Income', icon: 'fa-coins' }
    ],
    expense: [
      { id: 'Food', name: 'Food & Dining', icon: 'fa-utensils' },
      { id: 'Travel', name: 'Travel & Transport', icon: 'fa-car' },
      { id: 'Education', name: 'Education', icon: 'fa-graduation-cap' },
      { id: 'Shopping', name: 'Shopping', icon: 'fa-bag-shopping' },
      { id: 'Bills', name: 'Bills & Utilities', icon: 'fa-file-invoice-dollar' },
      { id: 'Healthcare', name: 'Healthcare', icon: 'fa-heart-pulse' },
      { id: 'Entertainment', name: 'Entertainment', icon: 'fa-film' },
      { id: 'Other Expenses', name: 'Other Expenses', icon: 'fa-ellipsis' }
    ]
  };

  // Color Palette for Categories & Charts
  const CATEGORY_COLORS = {
    'Food': '#f97316',
    'Travel': '#3b82f6',
    'Education': '#8b5cf6',
    'Shopping': '#ec4899',
    'Bills': '#eab308',
    'Healthcare': '#ef4444',
    'Entertainment': '#06b6d4',
    'Other Expenses': '#64748b',
    'Salary': '#10b981',
    'Freelancing': '#14b8a6',
    'Business': '#6366f1',
    'Investment': '#84cc16',
    'Other Income': '#059669'
  };

  // State Container
  let state = {
    transactions: [],
    filters: {
      search: '',
      type: 'all',
      category: 'all',
      startDate: '',
      endDate: ''
    },
    editingId: null,
    pendingActionId: null,
    pendingActionType: null // 'delete' or 'clearAll'
  };

  // 2. DOM Elements Selection
  const elements = {
    // Theme
    html: document.documentElement,
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),

    // Summary Cards
    totalIncome: document.getElementById('total-income'),
    totalExpenses: document.getElementById('total-expenses'),
    remainingBalance: document.getElementById('remaining-balance'),
    balanceStatus: document.getElementById('balance-status'),
    metricCount: document.getElementById('metric-count'),
    metricHighestCat: document.getElementById('metric-highest-cat'),
    metricMonthSpending: document.getElementById('metric-month-spending'),

    // Filters
    filterSearch: document.getElementById('filter-search'),
    filterType: document.getElementById('filter-type'),
    filterCategory: document.getElementById('filter-category'),
    filterStartDate: document.getElementById('filter-start-date'),
    filterEndDate: document.getElementById('filter-end-date'),
    btnResetFilters: document.getElementById('btn-reset-filters'),

    // Table & Card Views
    transactionTableBody: document.getElementById('transaction-table-body'),
    transactionCardsContainer: document.getElementById('transaction-cards-container'),
    emptyState: document.getElementById('empty-state'),
    filteredCountBadge: document.getElementById('filtered-count-badge'),
    btnEmptyAdd: document.getElementById('btn-empty-add'),

    // Header Actions
    btnOpenModal: document.getElementById('btn-open-modal'),
    btnExportCSV: document.getElementById('btn-export-csv'),
    btnClearAll: document.getElementById('btn-clear-all'),

    // Transaction Modal & Form
    transactionModal: document.getElementById('transaction-modal'),
    modalTitle: document.getElementById('modal-title'),
    transactionForm: document.getElementById('transaction-form'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnCancelModal: document.getElementById('btn-cancel-modal'),
    typeExpense: document.getElementById('type-expense'),
    typeIncome: document.getElementById('type-income'),
    modalBalanceLimitInfo: document.getElementById('modal-balance-limit-info'),
    modalAvailableBalance: document.getElementById('modal-available-balance'),
    txDescription: document.getElementById('tx-description'),
    txAmount: document.getElementById('tx-amount'),
    txDate: document.getElementById('tx-date'),
    txCategory: document.getElementById('tx-category'),
    txNotes: document.getElementById('tx-notes'),
    errDescription: document.getElementById('err-description'),
    errAmount: document.getElementById('err-amount'),
    errDate: document.getElementById('err-date'),
    errCategory: document.getElementById('err-category'),

    // Confirm Modal
    confirmModal: document.getElementById('confirm-modal'),
    confirmModalTitle: document.getElementById('confirm-modal-title'),
    confirmModalMessage: document.getElementById('confirm-modal-message'),
    btnCloseConfirm: document.getElementById('btn-close-confirm'),
    btnCancelConfirm: document.getElementById('btn-cancel-confirm'),
    btnActionConfirm: document.getElementById('btn-action-confirm'),

    // Toast Container
    toastContainer: document.getElementById('toast-container'),

    // Bootstrap Analytics Elements
    categoryProgressList: document.getElementById('category-progress-list'),
    categoryEmptyNotice: document.getElementById('category-empty-notice'),
    categoryTotalBadge: document.getElementById('category-total-badge'),
    ratioIncomeBar: document.getElementById('ratio-income-bar'),
    ratioExpenseBar: document.getElementById('ratio-expense-bar'),
    ratioIncomePct: document.getElementById('ratio-income-pct'),
    ratioExpensePct: document.getElementById('ratio-expense-pct'),
    ratioIncomeAmt: document.getElementById('ratio-income-amt'),
    ratioExpenseAmt: document.getElementById('ratio-expense-amt'),
    savingsRateBadge: document.getElementById('savings-rate-badge'),
    ratioHealthMessage: document.getElementById('ratio-health-message'),
    monthlySpendingGrid: document.getElementById('monthly-spending-grid'),
    monthlySummaryBadge: document.getElementById('monthly-summary-badge')
  };

  // 3. Helper Functions & Utilities
  /**
   * Format a numerical value into Indian Rupees (₹) string format.
   * @param {number} amount
   * @returns {string} Formatted currency string
   */
  function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(num);
  }

  /**
   * Escape HTML input strings to prevent XSS vulnerabilities.
   * @param {string} str
   * @returns {string} Sanitized string
   */
  function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  /**
   * Format YYYY-MM-DD date into human-readable format.
   * @param {string} dateString
   * @returns {string}
   */
  function formatDateReadable(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Show a dynamic toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';

    toast.innerHTML = `
      <i class="fa-solid ${iconClass}"></i>
      <span>${sanitizeHTML(message)}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // 4. LocalStorage & Initial Demo Data Management

  /**
   * Get initial sample demo transactions to populate on first launch.
   */
  function getDemoTransactions() {
    const today = new Date();
    const formatDate = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offsetDays);
      return d.toISOString().split('T')[0];
    };

    return [
      {
        id: 'tx-1',
        description: 'Monthly Salary',
        amount: 85000,
        type: 'income',
        category: 'Salary',
        date: formatDate(2),
        notes: 'Direct bank deposit from employer'
      },
      {
        id: 'tx-2',
        description: 'Grocery & Supplies',
        amount: 4250,
        type: 'expense',
        category: 'Food',
        date: formatDate(4),
        notes: 'Supermarket weekly groceries'
      },
      {
        id: 'tx-3',
        description: 'Freelance Design Client',
        amount: 25000,
        type: 'income',
        category: 'Freelancing',
        date: formatDate(6),
        notes: 'UI design project milestone'
      },
      {
        id: 'tx-4',
        description: 'Electricity & Wifi Bills',
        amount: 3200,
        type: 'expense',
        category: 'Bills',
        date: formatDate(8),
        notes: 'Monthly utility bills'
      },
      {
        id: 'tx-5',
        description: 'Weekend Apparel Shopping',
        amount: 6800,
        type: 'expense',
        category: 'Shopping',
        date: formatDate(12),
        notes: 'New winter clothes'
      },
      {
        id: 'tx-6',
        description: 'Fuel & Cab Fare',
        amount: 2100,
        type: 'expense',
        category: 'Travel',
        date: formatDate(15),
        notes: 'Petrol fill up'
      }
    ];
  }

  /**
   * Load stored transactions from browser localStorage.
   */
  function loadTransactions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (stored) {
        state.transactions = JSON.parse(stored);
      } else {
        // First launch - set demo data
        state.transactions = getDemoTransactions();
        saveTransactions();
      }
    } catch (err) {
      console.error('Failed to parse localStorage data:', err);
      state.transactions = getDemoTransactions();
    }
  }

  /**
   * Save current transactions to localStorage.
   */
  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(state.transactions));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
      showToast('Error saving data to local storage', 'error');
    }
  }

  // --------------------------------------------------------------------------
  // 5. Category Dropdown & Form Handlers
  // --------------------------------------------------------------------------

  /**
   * Populate category selects for the main form and filter dropdown.
   */
  function populateCategoryDropdowns(selectedType = 'expense') {
    // Populate form category
    elements.txCategory.innerHTML = '';
    const currentCats = CATEGORIES[selectedType] || [];
    currentCats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      elements.txCategory.appendChild(opt);
    });

    // Populate filter category options once
    if (elements.filterCategory.children.length <= 1) {
      const allCats = [...CATEGORIES.income, ...CATEGORIES.expense];
      allCats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${cat.name} (${cat.id in CATEGORY_COLORS && CATEGORIES.income.some(c=>c.id===cat.id) ? 'Income' : 'Expense'})`;
        elements.filterCategory.appendChild(opt);
      });
    }
  }

  /**
   * Update available balance info indicator in the transaction modal.
   */
  function updateModalAvailableBalance() {
    if (!elements.modalBalanceLimitInfo) return;
    const isIncomeSelected = elements.typeIncome.checked;
    
    if (isIncomeSelected) {
      elements.modalBalanceLimitInfo.className = 'balance-limit-info balance-limit-income';
      elements.modalBalanceLimitInfo.innerHTML = '<i class="fa-solid fa-circle-info"></i> <span>Income adds funds to your balance. No spending limit.</span>';
      return;
    }

    elements.modalBalanceLimitInfo.className = 'balance-limit-info';
    let available = 0;
    state.transactions.forEach(t => {
      if (t.id === state.editingId) return; // exclude item currently being edited
      if (t.type === 'income') available += Number(t.amount) || 0;
      if (t.type === 'expense') available -= Number(t.amount) || 0;
    });

    elements.modalBalanceLimitInfo.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Available Balance for Expense: <strong id="modal-available-balance">${formatCurrency(Math.max(0, available))}</strong>`;
  }

  /**
   * Open modal to Add or Edit transaction.
   * @param {Object|null} txToEdit
   */
  function openTransactionModal(txToEdit = null) {
    resetFormValidation();

    if (txToEdit) {
      state.editingId = txToEdit.id;
      elements.modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Transaction';
      
      if (txToEdit.type === 'income') {
        elements.typeIncome.checked = true;
        elements.typeExpense.checked = false;
      } else {
        elements.typeExpense.checked = true;
        elements.typeIncome.checked = false;
      }
      populateCategoryDropdowns(txToEdit.type);

      elements.txDescription.value = txToEdit.description;
      elements.txAmount.value = txToEdit.amount;
      elements.txDate.value = txToEdit.date;
      elements.txCategory.value = txToEdit.category;
      elements.txNotes.value = txToEdit.notes || '';
    } else {
      state.editingId = null;
      elements.modalTitle.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add New Transaction';
      elements.transactionForm.reset();
      elements.typeExpense.checked = true;
      elements.typeIncome.checked = false;
      populateCategoryDropdowns('expense');
      elements.txDate.value = new Date().toISOString().split('T')[0];
    }

    updateModalAvailableBalance();
    elements.transactionModal.classList.remove('hidden');
    elements.transactionModal.setAttribute('aria-hidden', 'false');

    // Reset scroll position to top
    const modalBody = elements.transactionModal.querySelector('.modal-body');
    if (modalBody) modalBody.scrollTop = 0;

    elements.txDescription.focus();
  }

  /**
   * Close transaction modal.
   */
  function closeTransactionModal() {
    elements.transactionModal.classList.add('hidden');
    elements.transactionModal.setAttribute('aria-hidden', 'true');
    state.editingId = null;
    resetFormValidation();
  }

  /**
   * Clear validation errors.
   */
  function resetFormValidation() {
    [elements.txDescription, elements.txAmount, elements.txDate, elements.txCategory].forEach(field => {
      if (field && field.parentElement) {
        field.parentElement.classList.remove('has-error');
      }
    });
    elements.errAmount.textContent = 'Enter a positive number greater than 0.';
  }

  /**
   * Validate form fields before submit with strict Balance Loss Prevention.
   */
  function validateForm() {
    let isValid = true;
    resetFormValidation();

    const description = elements.txDescription.value.trim();
    const amount = parseFloat(elements.txAmount.value);
    const date = elements.txDate.value;
    const category = elements.txCategory.value;
    const isIncome = elements.typeIncome.checked;

    if (!description) {
      elements.txDescription.parentElement.classList.add('has-error');
      isValid = false;
    }

    if (isNaN(amount) || amount <= 0) {
      elements.txAmount.parentElement.parentElement.classList.add('has-error');
      isValid = false;
    }

    if (!date) {
      elements.txDate.parentElement.classList.add('has-error');
      isValid = false;
    }

    if (!category) {
      elements.txCategory.parentElement.classList.add('has-error');
      isValid = false;
    }

    if (!isValid) return false;

    // --- Loss Prevention Rule Check ---
    let projectedIncome = 0;
    let projectedExpenses = 0;

    state.transactions.forEach(t => {
      if (t.id === state.editingId) return; // exclude transaction currently being edited
      if (t.type === 'income') projectedIncome += Number(t.amount) || 0;
      if (t.type === 'expense') projectedExpenses += Number(t.amount) || 0;
    });

    if (isIncome) {
      projectedIncome += amount;
    } else {
      projectedExpenses += amount;
    }

    const projectedBalance = projectedIncome - projectedExpenses;

    if (projectedBalance < 0) {
      elements.txAmount.parentElement.parentElement.classList.add('has-error');
      const maxAllowedExpense = projectedIncome - (projectedExpenses - amount);
      const formattedMax = formatCurrency(Math.max(0, maxAllowedExpense));

      elements.errAmount.textContent = `Insufficient balance! Maximum allowed expense is ${formattedMax}.`;
      showToast(`Transaction blocked! Remaining balance cannot be negative (Deficit of ${formatCurrency(Math.abs(projectedBalance))}).`, 'error');
      return false;
    }

    return true;
  }

  /**
   * Form submit handler (Add / Edit).
   */
  function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const type = elements.typeIncome.checked ? 'income' : 'expense';
    const txData = {
      description: elements.txDescription.value.trim(),
      amount: parseFloat(elements.txAmount.value),
      type: type,
      category: elements.txCategory.value,
      date: elements.txDate.value,
      notes: elements.txNotes.value.trim()
    };

    if (state.editingId) {
      // Edit existing
      const index = state.transactions.findIndex(t => t.id === state.editingId);
      if (index !== -1) {
        state.transactions[index] = { ...state.transactions[index], ...txData };
        showToast('Transaction updated successfully!', 'success');
      }
    } else {
      // Add new
      const newTx = {
        id: 'tx-' + Date.now(),
        ...txData
      };
      state.transactions.unshift(newTx);
      showToast('Transaction added successfully!', 'success');
    }

    saveTransactions();
    closeTransactionModal();
    updateUI();
  }

  // --------------------------------------------------------------------------
  // 6. Confirmation Modal & Deletion Engine
  // --------------------------------------------------------------------------

  /**
   * Open confirmation dialog.
   */
  function openConfirmModal(title, message, actionType, actionId = null) {
    state.pendingActionType = actionType;
    state.pendingActionId = actionId;

    elements.confirmModalTitle.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${title}`;
    elements.confirmModalMessage.textContent = message;

    if (actionType === 'clearAll') {
      elements.btnActionConfirm.textContent = 'Clear All';
    } else {
      elements.btnActionConfirm.textContent = 'Delete';
    }

    elements.confirmModal.classList.remove('hidden');
  }

  /**
   * Close confirmation dialog.
   */
  function closeConfirmModal() {
    elements.confirmModal.classList.add('hidden');
    state.pendingActionType = null;
    state.pendingActionId = null;
  }

  /**
   * Execute confirmed delete / clear action with Balance Loss Prevention.
   */
  function handleConfirmAction() {
    if (state.pendingActionType === 'delete' && state.pendingActionId) {
      const txToDelete = state.transactions.find(t => t.id === state.pendingActionId);

      // Loss Prevention Check when deleting an income transaction
      if (txToDelete && txToDelete.type === 'income') {
        let projectedIncome = 0;
        let projectedExpenses = 0;
        state.transactions.forEach(t => {
          if (t.id === state.pendingActionId) return;
          if (t.type === 'income') projectedIncome += Number(t.amount) || 0;
          if (t.type === 'expense') projectedExpenses += Number(t.amount) || 0;
        });

        const projectedBalance = projectedIncome - projectedExpenses;
        if (projectedBalance < 0) {
          showToast(`Cannot delete income! Remaining expenses exceed remaining income by ${formatCurrency(Math.abs(projectedBalance))}.`, 'error');
          closeConfirmModal();
          return;
        }
      }

      state.transactions = state.transactions.filter(t => t.id !== state.pendingActionId);
      saveTransactions();
      showToast('Transaction deleted.', 'info');
    } else if (state.pendingActionType === 'clearAll') {
      state.transactions = [];
      saveTransactions();
      showToast('All transactions cleared.', 'info');
    }
    closeConfirmModal();
    updateUI();
  }

  // --------------------------------------------------------------------------
  // 7. Filtering & Data Calculations
  // --------------------------------------------------------------------------

  /**
   * Filter state transactions based on user inputs.
   */
  function getFilteredTransactions() {
    return state.transactions.filter(tx => {
      // Search
      if (state.filters.search) {
        const query = state.filters.search.toLowerCase();
        const descMatch = tx.description.toLowerCase().includes(query);
        const catMatch = tx.category.toLowerCase().includes(query);
        if (!descMatch && !catMatch) return false;
      }

      // Type
      if (state.filters.type !== 'all' && tx.type !== state.filters.type) {
        return false;
      }

      // Category
      if (state.filters.category !== 'all' && tx.category !== state.filters.category) {
        return false;
      }

      // Date Range
      if (state.filters.startDate && tx.date < state.filters.startDate) {
        return false;
      }
      if (state.filters.endDate && tx.date > state.filters.endDate) {
        return false;
      }

      return true;
    });
  }

  /**
   * Calculate summary metrics from transaction data.
   */
  function calculateSummary(txList) {
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};
    const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
    let currentMonthSpending = 0;

    txList.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
      } else if (tx.type === 'expense') {
        totalExpenses += amt;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;

        if (tx.date && tx.date.startsWith(currentMonthStr)) {
          currentMonthSpending += amt;
        }
      }
    });

    const balance = totalIncome - totalExpenses;

    // Determine highest expense category
    let highestCat = 'None';
    let maxCatVal = 0;
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > maxCatVal) {
        maxCatVal = val;
        highestCat = `${cat} (${formatCurrency(val)})`;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      balance,
      count: txList.length,
      highestCat,
      currentMonthSpending
    };
  }

  // --------------------------------------------------------------------------
  // 8. UI Rendering Engine
  // --------------------------------------------------------------------------

  /**
   * Update all components on UI state change.
   */
  function updateUI() {
    const filteredTx = getFilteredTransactions();

    // 1. Update Summary Cards & Metrics
    const summary = calculateSummary(filteredTx);
    elements.totalIncome.textContent = formatCurrency(summary.totalIncome);
    elements.totalExpenses.textContent = formatCurrency(summary.totalExpenses);
    elements.remainingBalance.textContent = formatCurrency(summary.balance);

    if (summary.balance < 0) {
      elements.remainingBalance.style.color = 'var(--expense-color)';
      elements.balanceStatus.className = 'card-subtitle status-negative';
      elements.balanceStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Deficit Balance';
    } else {
      elements.remainingBalance.style.color = 'var(--primary-color)';
      elements.balanceStatus.className = 'card-subtitle status-positive';
      elements.balanceStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Healthy Balance';
    }

    elements.metricCount.textContent = summary.count;
    elements.metricHighestCat.textContent = summary.highestCat;
    elements.metricMonthSpending.textContent = formatCurrency(summary.currentMonthSpending);
    elements.filteredCountBadge.textContent = `${filteredTx.length} items`;

    // 2. Render History Tables & Mobile Cards
    renderTransactionList(filteredTx);

    // 3. Update Bootstrap Analytics Widgets
    updateAnalyticsWidgets(filteredTx);
  }

  /**
   * Render transaction rows for desktop table and cards for mobile.
   */
  function renderTransactionList(filteredTx) {
    elements.transactionTableBody.innerHTML = '';
    elements.transactionCardsContainer.innerHTML = '';

    if (filteredTx.length === 0) {
      elements.emptyState.classList.remove('hidden');
      return;
    } else {
      elements.emptyState.classList.add('hidden');
    }

    // Sort newest date first
    const sortedTx = [...filteredTx].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTx.forEach(tx => {
      // Find category icon
      let catIcon = 'fa-tag';
      const allCatDefs = [...CATEGORIES.income, ...CATEGORIES.expense];
      const matchCat = allCatDefs.find(c => c.id === tx.category);
      if (matchCat) catIcon = matchCat.icon;

      const isIncome = tx.type === 'income';
      const amountPrefix = isIncome ? '+' : '-';
      const amountClass = isIncome ? 'tx-amount-income' : 'tx-amount-expense';
      const typeBadgeClass = isIncome ? 'badge-income' : 'badge-expense';

      // --- Desktop Table Row ---
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDateReadable(tx.date)}</td>
        <td>
          <span class="tx-title">${sanitizeHTML(tx.description)}</span>
          ${tx.notes ? `<span class="tx-notes-sub"><i class="fa-regular fa-note-sticky"></i> ${sanitizeHTML(tx.notes)}</span>` : ''}
        </td>
        <td>
          <span class="badge-category">
            <i class="fa-solid ${catIcon}"></i> ${sanitizeHTML(tx.category)}
          </span>
        </td>
        <td>
          <span class="badge-type ${typeBadgeClass}">${tx.type}</span>
        </td>
        <td class="text-right ${amountClass}">
          ${amountPrefix}${formatCurrency(tx.amount)}
        </td>
        <td class="text-center">
          <button class="btn-action-icon btn-action-edit" data-id="${tx.id}" title="Edit Transaction">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="btn-action-icon btn-action-delete" data-id="${tx.id}" title="Delete Transaction">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;
      elements.transactionTableBody.appendChild(tr);

      // --- Mobile Card View ---
      const card = document.createElement('div');
      card.className = 'mobile-tx-card';
      card.innerHTML = `
        <div class="mobile-tx-header">
          <div>
            <span class="tx-title">${sanitizeHTML(tx.description)}</span>
            <span class="card-subtitle">${formatDateReadable(tx.date)}</span>
          </div>
          <span class="${amountClass}" style="font-size: 1.1rem;">
            ${amountPrefix}${formatCurrency(tx.amount)}
          </span>
        </div>
        ${tx.notes ? `<div style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-regular fa-note-sticky"></i> ${sanitizeHTML(tx.notes)}</div>` : ''}
        <div class="mobile-tx-body">
          <span class="badge-category">
            <i class="fa-solid ${catIcon}"></i> ${sanitizeHTML(tx.category)}
          </span>
          <div class="mobile-tx-actions">
            <button class="btn-action-icon btn-action-edit" data-id="${tx.id}">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="btn-action-icon btn-action-delete" data-id="${tx.id}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
      elements.transactionCardsContainer.appendChild(card);
    });

    // Attach row/card button action listeners
    document.querySelectorAll('.btn-action-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const tx = state.transactions.find(t => t.id === id);
        if (tx) openTransactionModal(tx);
      });
    });

    document.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const tx = state.transactions.find(t => t.id === id);
        if (tx) {
          openConfirmModal('Delete Transaction', `Are you sure you want to delete "${tx.description}"?`, 'delete', id);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 9. Bootstrap Financial Analytics & Insights Engine
  // --------------------------------------------------------------------------

  /**
   * Update Bootstrap visual analytics widgets based on current filtered transactions.
   */
  function updateAnalyticsWidgets(filteredTx) {
    // ------------------------------------------------------------------------
    // 1. Expense Category Breakdown (Bootstrap Progress Bars)
    // ------------------------------------------------------------------------
    const expenseTx = filteredTx.filter(t => t.type === 'expense');
    const categoryTotals = {};
    let totalExpenses = 0;

    expenseTx.forEach(t => {
      const amt = Number(t.amount) || 0;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
      totalExpenses += amt;
    });

    if (elements.categoryTotalBadge) {
      elements.categoryTotalBadge.textContent = `${formatCurrency(totalExpenses)} Total`;
    }

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length === 0) {
      elements.categoryProgressList.innerHTML = '';
      elements.categoryEmptyNotice.classList.remove('hidden');
    } else {
      elements.categoryEmptyNotice.classList.add('hidden');
      elements.categoryProgressList.innerHTML = '';

      sortedCategories.forEach(([catName, catAmt]) => {
        const pct = totalExpenses > 0 ? ((catAmt / totalExpenses) * 100).toFixed(1) : 0;
        const catColor = CATEGORY_COLORS[catName] || '#6366f1';
        
        // Find matched category icon
        const allCats = [...CATEGORIES.income, ...CATEGORIES.expense];
        const match = allCats.find(c => c.id === catName);
        const catIcon = match ? match.icon : 'fa-tags';

        const item = document.createElement('div');
        item.className = 'category-progress-item';
        item.innerHTML = `
          <div class="category-progress-meta">
            <div class="category-meta-left">
              <span class="category-dot" style="background-color: ${catColor};"></span>
              <i class="fa-solid ${catIcon} text-muted" style="font-size: 0.8rem;"></i>
              <span>${sanitizeHTML(catName)}</span>
            </div>
            <div class="category-meta-right">
              <span class="category-amt">${formatCurrency(catAmt)}</span>
              <span class="category-pct" style="background-color: ${catColor}1a; color: ${catColor}; border: 1px solid ${catColor}33;">${pct}%</span>
            </div>
          </div>
          <div class="category-progress-bar-wrap">
            <div class="category-progress-bar-fill" style="width: ${pct}%; background-color: ${catColor};"></div>
          </div>
        `;
        elements.categoryProgressList.appendChild(item);
      });
    }

    // ------------------------------------------------------------------------
    // 2. Income vs. Expense Ratio & Cashflow Health (Bootstrap Dual Progress Meter)
    // ------------------------------------------------------------------------
    let totalIncome = 0;
    filteredTx.forEach(t => {
      if (t.type === 'income') totalIncome += Number(t.amount) || 0;
    });

    const turnover = totalIncome + totalExpenses;
    let incomePct = 50;
    let expensePct = 50;

    if (turnover > 0) {
      incomePct = ((totalIncome / turnover) * 100).toFixed(1);
      expensePct = ((totalExpenses / turnover) * 100).toFixed(1);
    } else {
      incomePct = 0;
      expensePct = 0;
    }

    if (elements.ratioIncomeBar && elements.ratioExpenseBar) {
      elements.ratioIncomeBar.style.width = `${turnover > 0 ? incomePct : 50}%`;
      elements.ratioExpenseBar.style.width = `${turnover > 0 ? expensePct : 50}%`;
      elements.ratioIncomePct.textContent = `${incomePct}%`;
      elements.ratioExpensePct.textContent = `${expensePct}%`;
      elements.ratioIncomeAmt.textContent = formatCurrency(totalIncome);
      elements.ratioExpenseAmt.textContent = formatCurrency(totalExpenses);

      // Savings rate calculation & Health status note
      if (totalIncome > 0) {
        const savingsRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);
        if (savingsRate >= 0) {
          elements.savingsRateBadge.className = 'badge rounded-pill bg-success-subtle text-success border border-success-subtle';
          elements.savingsRateBadge.textContent = `Savings: ${savingsRate}%`;
          elements.ratioHealthMessage.className = 'alert alert-success d-flex align-items-center gap-2 mt-3 mb-0 py-2 px-3 small border-0';
          elements.ratioHealthMessage.innerHTML = `<i class="fa-solid fa-circle-check fs-6 text-success"></i><span>Cashflow is positive! You are saving <strong>${savingsRate}%</strong> of your income.</span>`;
        } else {
          elements.savingsRateBadge.className = 'badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle';
          elements.savingsRateBadge.textContent = `Deficit: ${Math.abs(savingsRate)}%`;
          elements.ratioHealthMessage.className = 'alert alert-danger d-flex align-items-center gap-2 mt-3 mb-0 py-2 px-3 small border-0';
          elements.ratioHealthMessage.innerHTML = `<i class="fa-solid fa-triangle-exclamation fs-6 text-danger"></i><span>Expenses exceed income! Reduce non-essential spending.</span>`;
        }
      } else {
        elements.savingsRateBadge.className = 'badge rounded-pill bg-secondary-subtle text-secondary border';
        elements.savingsRateBadge.textContent = 'Savings: 0%';
        elements.ratioHealthMessage.className = 'alert alert-secondary d-flex align-items-center gap-2 mt-3 mb-0 py-2 px-3 small border-0';
        elements.ratioHealthMessage.innerHTML = '<i class="fa-solid fa-info-circle fs-6"></i><span>Log income transactions to see your savings rate meter.</span>';
      }
    }

    // ------------------------------------------------------------------------
    // 3. Monthly Spending Overview (Bootstrap Cards & Progress Bars)
    // ------------------------------------------------------------------------
    const monthlyMap = {};
    state.transactions.filter(t => t.type === 'expense').forEach(t => {
      if (t.date) {
        const monthKey = t.date.substring(0, 7); // YYYY-MM
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + Number(t.amount);
      }
    });

    const sortedMonths = Object.keys(monthlyMap).sort().reverse();
    if (elements.monthlySummaryBadge) {
      elements.monthlySummaryBadge.textContent = `${sortedMonths.length} Months Tracked`;
    }
    
    if (elements.monthlySpendingGrid) {
      elements.monthlySpendingGrid.innerHTML = '';

      if (sortedMonths.length === 0) {
        elements.monthlySpendingGrid.innerHTML = '<div class="text-muted small py-3"><i class="fa-regular fa-calendar-xmark me-1"></i> No monthly expense records available.</div>';
      } else {
        let maxMonthlySpend = Math.max(...Object.values(monthlyMap), 1);

        sortedMonths.forEach(mKey => {
          const [year, month] = mKey.split('-');
          const d = new Date(year, month - 1, 1);
          const monthName = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
          const monthAmt = monthlyMap[mKey];
          const relativePct = Math.round((monthAmt / maxMonthlySpend) * 100);

          const mCard = document.createElement('div');
          mCard.className = 'monthly-spend-card';
          mCard.innerHTML = `
            <div class="monthly-spend-card-header">
              <span class="monthly-spend-month"><i class="fa-regular fa-calendar me-1"></i> ${monthName}</span>
              <span class="badge rounded-pill bg-danger-subtle text-danger" style="font-size: 0.72rem;">${relativePct}% of peak</span>
            </div>
            <div class="monthly-spend-amt">${formatCurrency(monthAmt)}</div>
            <div class="progress" style="height: 6px; background-color: var(--bg-card);">
              <div class="progress-bar bg-danger" role="progressbar" style="width: ${relativePct}%" aria-valuenow="${relativePct}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          `;
          elements.monthlySpendingGrid.appendChild(mCard);
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 10. CSV Export Functionality
  // --------------------------------------------------------------------------

  function exportToCSV() {
    const filteredTx = getFilteredTransactions();

    if (filteredTx.length === 0) {
      showToast('No transactions available to export!', 'error');
      return;
    }

    const headers = ['Transaction ID', 'Date', 'Description', 'Type', 'Category', 'Amount (INR)', 'Notes'];
    const rows = filteredTx.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      t.amount,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Tracker_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV Export downloaded successfully!', 'success');
  }

  // --------------------------------------------------------------------------
  // 11. Theme Management (Light / Dark Mode)
  // --------------------------------------------------------------------------

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function setTheme(theme) {
    elements.html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);

    if (theme === 'dark') {
      elements.themeIcon.className = 'fa-solid fa-sun';
    } else {
      elements.themeIcon.className = 'fa-solid fa-moon';
    }

    // Re-render analytics widgets to update colors
    if (state.transactions) updateAnalyticsWidgets(getFilteredTransactions());
  }

  function toggleTheme() {
    const currentTheme = elements.html.getAttribute('data-theme') || 'light';
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  }

  // --------------------------------------------------------------------------
  // 12. Event Listeners Setup
  // --------------------------------------------------------------------------

  function setupEventListeners() {
    // Theme Switcher
    elements.btnThemeToggle.addEventListener('click', toggleTheme);

    // Modal Control
    elements.btnOpenModal.addEventListener('click', () => openTransactionModal(null));
    elements.btnCloseModal.addEventListener('click', closeTransactionModal);
    elements.btnCancelModal.addEventListener('click', closeTransactionModal);
    elements.btnEmptyAdd.addEventListener('click', () => openTransactionModal(null));

    // Modal Type Switcher Radio
    const setTransactionType = (type) => {
      if (type === 'income') {
        elements.typeIncome.checked = true;
        elements.typeExpense.checked = false;
      } else {
        elements.typeExpense.checked = true;
        elements.typeIncome.checked = false;
      }
      populateCategoryDropdowns(type);
      updateModalAvailableBalance();
    };

    elements.typeExpense.addEventListener('change', () => setTransactionType('expense'));
    elements.typeIncome.addEventListener('change', () => setTransactionType('income'));

    const labelExpense = document.querySelector('label[for="type-expense"]');
    const labelIncome = document.querySelector('label[for="type-income"]');
    if (labelExpense) {
      labelExpense.addEventListener('click', (e) => {
        e.preventDefault();
        setTransactionType('expense');
      });
    }
    if (labelIncome) {
      labelIncome.addEventListener('click', (e) => {
        e.preventDefault();
        setTransactionType('income');
      });
    }

    // Form Submit
    elements.transactionForm.addEventListener('submit', handleFormSubmit);

    // Filter Listeners
    elements.filterSearch.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      updateUI();
    });

    elements.filterType.addEventListener('change', (e) => {
      state.filters.type = e.target.value;
      updateUI();
    });

    elements.filterCategory.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      updateUI();
    });

    elements.filterStartDate.addEventListener('change', (e) => {
      state.filters.startDate = e.target.value;
      updateUI();
    });

    elements.filterEndDate.addEventListener('change', (e) => {
      state.filters.endDate = e.target.value;
      updateUI();
    });

    // Reset Filters
    elements.btnResetFilters.addEventListener('click', () => {
      state.filters = { search: '', type: 'all', category: 'all', startDate: '', endDate: '' };
      elements.filterSearch.value = '';
      elements.filterType.value = 'all';
      elements.filterCategory.value = 'all';
      elements.filterStartDate.value = '';
      elements.filterEndDate.value = '';
      updateUI();
      showToast('Filters reset.', 'info');
    });

    // CSV Export & Clear All
    elements.btnExportCSV.addEventListener('click', exportToCSV);
    elements.btnClearAll.addEventListener('click', () => {
      if (state.transactions.length === 0) {
        showToast('No transactions to clear.', 'error');
        return;
      }
      openConfirmModal('Clear All Transactions', 'Are you sure you want to erase all transaction records? This action cannot be undone.', 'clearAll');
    });

    // Confirm Modal Actions
    elements.btnCloseConfirm.addEventListener('click', closeConfirmModal);
    elements.btnCancelConfirm.addEventListener('click', closeConfirmModal);
    elements.btnActionConfirm.addEventListener('click', handleConfirmAction);

    // Close modals on clicking overlay background
    elements.transactionModal.addEventListener('click', (e) => {
      if (e.target === elements.transactionModal) closeTransactionModal();
    });

    elements.confirmModal.addEventListener('click', (e) => {
      if (e.target === elements.confirmModal) closeConfirmModal();
    });
  }

  // --------------------------------------------------------------------------
  // 13. Application Initialization
  // --------------------------------------------------------------------------

  function initApp() {
    initTheme();
    loadTransactions();
    populateCategoryDropdowns('expense');
    setupEventListeners();
    updateUI();
  }

  // Fire App Init
  initApp();

});

/**
 * App Logic - page initialization, event handlers, rendering
 */

// ===========================================
// AUTH PAGE
// ===========================================
function switchTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  try {
    const result = await API.login(email, password);
    API.setToken(result.accessToken);
    API.setUser(result.user);
    window.location.href = '/dashboard';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const fullName = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const errorEl = document.getElementById('registerError');

  try {
    const result = await API.register(email, password, fullName);
    API.setToken(result.accessToken);
    API.setUser(result.user);
    window.location.href = '/dashboard';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  }
}

// ===========================================
// COMMON - Sidebar, Topbar, User
// ===========================================
function initApp() {
  const path = window.location.pathname;

  // Check auth for protected pages
  if (path !== '/auth' && path !== '/') {
    if (!API.isAuthenticated()) {
      window.location.href = '/auth';
      return;
    }
    setupUser();
    setupSidebar();
    setupNotifications();
  }

  // Initialize correct page
  if (path === '/dashboard') initDashboard();
  else if (path === '/transactions') initTransactions();
  else if (path === '/categories') initCategories();
  else if (path === '/budgets') initBudgets();
}

function setupUser() {
  const user = API.getUser();
  if (user) {
    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    if (nameEl) nameEl.textContent = user.fullName || 'User';
    if (emailEl) emailEl.textContent = user.email || '';
  }

  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      API.removeToken();
      window.location.href = '/auth';
    });
  }
}

function setupSidebar() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) link.classList.add('active');
  });

  const mobileBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}

async function setupNotifications() {
  try {
    const notifications = await API.getNotifications();
    const unread = notifications.filter(n => !n.isRead);
    const badge = document.getElementById('notificationBadge');
    const bell = document.getElementById('notificationBell');
    const dropdown = document.getElementById('notificationsDropdown');
    const list = document.getElementById('notificationsList');

    if (unread.length > 0) {
      badge.textContent = unread.length;
      badge.style.display = 'flex';
    }

    // Render notifications
    if (notifications.length > 0) {
      list.innerHTML = notifications.slice(0, 10).map(n => `
        <div class="notification-item ${n.isRead ? '' : 'unread'}" onclick="API.markAsRead('${n.id}')">
          <div class="notif-title">${n.title}</div>
          <div class="notif-message">${n.message}</div>
          <div class="notif-time">${formatDate(n.createdAt)}</div>
        </div>
      `).join('');
    }

    // Toggle dropdown
    if (bell) {
      bell.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
      });
    }

    document.addEventListener('click', () => {
      if (dropdown) dropdown.style.display = 'none';
    });

    const markAllBtn = document.getElementById('markAllRead');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', async () => {
        await API.markAllAsRead();
        badge.style.display = 'none';
        document.querySelectorAll('.notification-item').forEach(el => el.classList.remove('unread'));
        showToast('Đã đánh dấu tất cả đã đọc');
      });
    }
  } catch (err) {
    console.error('Failed to load notifications:', err);
  }
}

// ===========================================
// DASHBOARD
// ===========================================
let trendChartInstance = null;
let categoryChartInstance = null;

async function initDashboard() {
  try {
    const [summary, trend, categoryData, budgetOverview, transactions] = await Promise.all([
      API.getSummary({ period: 'MONTHLY' }),
      API.getTrend({}),
      API.getByCategory({ period: 'MONTHLY', type: 'EXPENSE' }),
      API.getBudgetOverview(),
      API.getTransactions({ limit: 5 }),
    ]);

    // Stat cards
    document.getElementById('totalIncome').textContent = formatCurrency(summary.totalIncome);
    document.getElementById('totalExpense').textContent = formatCurrency(summary.totalExpense);
    document.getElementById('totalBalance').textContent = formatCurrency(summary.balance);
    document.getElementById('savingsRate').textContent = `${summary.savingsRate || 0}%`;

    // Trend chart
    renderTrendChart(trend);

    // Category chart
    renderCategoryChart(categoryData);

    // Budget overview
    renderBudgetOverview(budgetOverview);

    // Recent transactions
    const txData = transactions.data || transactions;
    renderRecentTransactions(Array.isArray(txData) ? txData : []);
  } catch (err) {
    console.error('Dashboard error:', err);
    showToast('Không thể tải dữ liệu dashboard', 'error');
  }
}

function renderTrendChart(trend) {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;

  if (trendChartInstance) trendChartInstance.destroy();

  const months = (trend.months || []);
  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(m => `T${m.month}`),
      datasets: [
        {
          label: 'Thu nhập',
          data: months.map(m => m.income),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
        {
          label: 'Chi tiêu',
          data: months.map(m => m.expense),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#9d9dba', font: { family: 'Inter' } } },
      },
      scales: {
        x: { ticks: { color: '#6b6b8d' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: {
          ticks: {
            color: '#6b6b8d',
            callback: (v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v,
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
      },
    },
  });
}

function renderCategoryChart(data) {
  const ctx = document.getElementById('categoryChart');
  if (!ctx || !data || data.length === 0) return;

  if (categoryChartInstance) categoryChartInstance.destroy();

  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.categoryName),
      datasets: [{
        data: data.map(d => d.total),
        backgroundColor: data.map(d => d.categoryColor || '#7c3aed'),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#9d9dba', font: { family: 'Inter', size: 11 }, padding: 12, usePointStyle: true },
        },
      },
    },
  });
}

function renderBudgetOverview(budgets) {
  const container = document.getElementById('budgetOverview');
  if (!container) return;

  if (!budgets || budgets.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-bullseye"></i><p>Chưa có ngân sách nào. <a href="/budgets">Tạo ngay</a></p></div>';
    return;
  }

  container.innerHTML = budgets.map(b => {
    const statusClass = b.status === 'EXCEEDED' ? 'exceeded' : b.status === 'WARNING' ? 'warning' : 'on-track';
    const pct = Math.min(b.percentage, 100);
    return `
      <div class="budget-card">
        <div class="budget-header">
          <div class="budget-category">
            <span>${b.budget?.category?.icon || '📂'}</span>
            <span>${b.budget?.category?.name || 'N/A'}</span>
            <span class="badge badge-${statusClass}">${b.status === 'EXCEEDED' ? 'Vượt' : b.status === 'WARNING' ? 'Cảnh báo' : 'Ổn'}</span>
          </div>
          <div class="budget-amounts">
            <span class="spent">${formatCurrency(b.spent)}</span> / <span class="total">${formatCurrency(b.budget?.amount)}</span>
          </div>
        </div>
        <div class="progress-bar"><div class="progress-fill ${statusClass}" style="width:${pct}%"></div></div>
        <div class="budget-footer">
          <span>Còn lại: ${formatCurrency(b.remaining)}</span>
          <span>${b.percentage}%</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecentTransactions(transactions) {
  const tbody = document.getElementById('recentTransactions');
  if (!tbody) return;

  if (transactions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><p>Chưa có giao dịch</p></td></tr>';
    return;
  }

  tbody.innerHTML = transactions.map(tx => `
    <tr>
      <td><span class="category-badge"><span class="cat-icon">${tx.category?.icon || '📂'}</span> ${tx.category?.name || 'N/A'}</span></td>
      <td>${tx.description || '-'}</td>
      <td>${formatDate(tx.transactionDate)}</td>
      <td class="${tx.type === 'INCOME' ? 'amount-income' : 'amount-expense'}">
        ${tx.type === 'INCOME' ? '+' : '-'}${formatCurrency(tx.amount)}
      </td>
    </tr>
  `).join('');
}

// ===========================================
// TRANSACTIONS PAGE
// ===========================================
let currentPage = 1;
let categoriesCache = [];

async function initTransactions() {
  await loadCategoriesForFilter();
  await loadTransactions();
}

async function loadCategoriesForFilter() {
  try {
    categoriesCache = await API.getCategories();
    const filterCat = document.getElementById('filterCategory');
    const txCat = document.getElementById('txCategory');

    if (filterCat) {
      filterCat.innerHTML = '<option value="">Tất cả danh mục</option>' +
        categoriesCache.map(c => `<option value="${c.id}">${c.icon || ''} ${c.name}</option>`).join('');
    }
    if (txCat) {
      txCat.innerHTML = '<option value="">Chọn danh mục</option>' +
        categoriesCache.map(c => `<option value="${c.id}">${c.icon || ''} ${c.name} (${c.type === 'INCOME' ? 'Thu' : 'Chi'})</option>`).join('');
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

async function loadTransactions() {
  const tbody = document.getElementById('transactionsTable');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6"><div class="loading-spinner"><div class="spinner"></div></div></td></tr>';

  try {
    const filters = {
      page: currentPage,
      limit: 15,
      type: document.getElementById('filterType')?.value || '',
      categoryId: document.getElementById('filterCategory')?.value || '',
      startDate: document.getElementById('filterStartDate')?.value || '',
      endDate: document.getElementById('filterEndDate')?.value || '',
    };

    const result = await API.getTransactions(filters);
    const transactions = result.data || result;
    const meta = result.meta;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-receipt"></i><p>Không có giao dịch nào</p></td></tr>';
      document.getElementById('transactionsPagination').style.display = 'none';
      return;
    }

    tbody.innerHTML = transactions.map(tx => `
      <tr>
        <td><span class="category-badge"><span class="cat-icon">${tx.category?.icon || '📂'}</span> ${tx.category?.name || 'N/A'}</span></td>
        <td>${tx.description || '-'}</td>
        <td>${formatDate(tx.transactionDate)}</td>
        <td><span class="badge badge-${tx.type === 'INCOME' ? 'income' : 'expense'}">${tx.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}</span></td>
        <td class="${tx.type === 'INCOME' ? 'amount-income' : 'amount-expense'}">
          ${tx.type === 'INCOME' ? '+' : '-'}${formatCurrency(tx.amount)}
        </td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" onclick="editTransaction('${tx.id}')" title="Sửa"><i class="fas fa-edit"></i></button>
            <button class="btn-icon danger" onclick="deleteTransaction('${tx.id}')" title="Xóa"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    // Pagination
    if (meta) {
      renderPagination(meta);
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><p>Lỗi: ${err.message}</p></td></tr>`;
  }
}

function renderPagination(meta) {
  const pagination = document.getElementById('transactionsPagination');
  const info = document.getElementById('paginationInfo');
  const controls = document.getElementById('paginationControls');

  pagination.style.display = 'flex';
  info.textContent = `Hiển thị ${((meta.page - 1) * meta.limit) + 1}-${Math.min(meta.page * meta.limit, meta.total)} / ${meta.total} giao dịch`;

  let html = `<button ${meta.page <= 1 ? 'disabled' : ''} onclick="goToPage(${meta.page - 1})">‹</button>`;
  for (let i = 1; i <= meta.totalPages; i++) {
    if (i <= 3 || i >= meta.totalPages - 1 || Math.abs(i - meta.page) <= 1) {
      html += `<button class="${i === meta.page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === 4 || i === meta.totalPages - 2) {
      html += `<button disabled>...</button>`;
    }
  }
  html += `<button ${meta.page >= meta.totalPages ? 'disabled' : ''} onclick="goToPage(${meta.page + 1})">›</button>`;
  controls.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  loadTransactions();
}

function clearFilters() {
  document.getElementById('filterType').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterStartDate').value = '';
  document.getElementById('filterEndDate').value = '';
  currentPage = 1;
  loadTransactions();
}

function openTransactionModal(tx = null) {
  document.getElementById('transactionModal').style.display = 'flex';
  document.getElementById('transactionModalTitle').textContent = tx ? 'Sửa giao dịch' : 'Thêm giao dịch';
  document.getElementById('txId').value = tx?.id || '';
  document.getElementById('txType').value = tx?.type || 'EXPENSE';
  document.getElementById('txAmount').value = tx?.amount || '';
  document.getElementById('txCategory').value = tx?.categoryId || '';
  document.getElementById('txDate').value = tx?.transactionDate || new Date().toISOString().split('T')[0];
  document.getElementById('txDescription').value = tx?.description || '';

  if (!tx) {
    document.getElementById('txType').disabled = false;
  } else {
    document.getElementById('txType').disabled = true;
  }
}

function closeTransactionModal() {
  document.getElementById('transactionModal').style.display = 'none';
}

async function saveTransaction(e) {
  e.preventDefault();
  const id = document.getElementById('txId').value;
  const data = {
    type: document.getElementById('txType').value,
    amount: parseFloat(document.getElementById('txAmount').value),
    categoryId: document.getElementById('txCategory').value,
    transactionDate: document.getElementById('txDate').value,
    description: document.getElementById('txDescription').value,
  };

  try {
    if (id) {
      delete data.type; // Can't change type
      await API.updateTransaction(id, data);
      showToast('Đã cập nhật giao dịch');
    } else {
      await API.createTransaction(data);
      showToast('Đã thêm giao dịch mới');
    }
    closeTransactionModal();
    loadTransactions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function editTransaction(id) {
  try {
    const tx = await API.getTransaction(id);
    openTransactionModal(tx);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteTransaction(id) {
  if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
  try {
    await API.deleteTransaction(id);
    showToast('Đã xóa giao dịch');
    loadTransactions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===========================================
// CATEGORIES PAGE
// ===========================================
async function initCategories() {
  await loadCategories();
}

async function loadCategories() {
  const container = document.getElementById('categoriesList');
  if (!container) return;

  try {
    const categories = await API.getCategories();

    if (categories.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-tags"></i><p>Chưa có danh mục nào</p></div>';
      return;
    }

    container.innerHTML = categories.map(cat => `
      <div class="category-card">
        <div class="category-icon" style="background:${cat.color}20; color:${cat.color}">
          ${cat.icon || '📂'}
        </div>
        <div class="category-info">
          <h4>${cat.name}</h4>
          <span class="badge badge-${cat.type === 'INCOME' ? 'income' : 'expense'}">${cat.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}</span>
        </div>
        <div class="category-actions">
          ${cat.isDefault ? '' : `
            <button class="btn-icon" onclick='editCategory(${JSON.stringify(cat).replace(/'/g, "&apos;")})' title="Sửa"><i class="fas fa-edit"></i></button>
            <button class="btn-icon danger" onclick="deleteCategory('${cat.id}')" title="Xóa"><i class="fas fa-trash"></i></button>
          `}
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Lỗi: ${err.message}</p></div>`;
  }
}

function openCategoryModal(cat = null) {
  document.getElementById('categoryModal').style.display = 'flex';
  document.getElementById('categoryModalTitle').textContent = cat ? 'Sửa danh mục' : 'Thêm danh mục';
  document.getElementById('catId').value = cat?.id || '';
  document.getElementById('catName').value = cat?.name || '';
  document.getElementById('catType').value = cat?.type || 'EXPENSE';
  document.getElementById('catIcon').value = cat?.icon || '';
  document.getElementById('catColor').value = cat?.color || '#7c3aed';

  document.getElementById('catType').disabled = !!cat;
}

function closeCategoryModal() {
  document.getElementById('categoryModal').style.display = 'none';
}

function editCategory(cat) {
  openCategoryModal(cat);
}

async function saveCategory(e) {
  e.preventDefault();
  const id = document.getElementById('catId').value;
  const data = {
    name: document.getElementById('catName').value,
    type: document.getElementById('catType').value,
    icon: document.getElementById('catIcon').value,
    color: document.getElementById('catColor').value,
  };

  try {
    if (id) {
      delete data.type;
      await API.updateCategory(id, data);
      showToast('Đã cập nhật danh mục');
    } else {
      await API.createCategory(data);
      showToast('Đã thêm danh mục mới');
    }
    closeCategoryModal();
    loadCategories();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteCategory(id) {
  if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
  try {
    await API.deleteCategory(id);
    showToast('Đã xóa danh mục');
    loadCategories();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===========================================
// BUDGETS PAGE
// ===========================================
async function initBudgets() {
  await loadBudgetCategories();
  await loadBudgets();
}

async function loadBudgetCategories() {
  try {
    const cats = await API.getCategories();
    const select = document.getElementById('budgetCategory');
    if (select) {
      select.innerHTML = '<option value="">Chọn danh mục chi tiêu</option>' +
        cats.filter(c => c.type === 'EXPENSE').map(c => `<option value="${c.id}">${c.icon || ''} ${c.name}</option>`).join('');
    }
  } catch (err) {
    console.error('Failed to load budget categories:', err);
  }
}

async function loadBudgets() {
  const container = document.getElementById('budgetsList');
  if (!container) return;

  try {
    const budgets = await API.getBudgets();

    if (budgets.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-bullseye"></i><p>Chưa có ngân sách nào. Hãy tạo để theo dõi chi tiêu!</p></div>';
      return;
    }

    // Get status for each budget
    const statusPromises = budgets.map(b => API.getBudgetStatus(b.id).catch(() => null));
    const statuses = await Promise.all(statusPromises);

    container.innerHTML = budgets.map((budget, i) => {
      const status = statuses[i];
      if (!status) return '';
      const statusClass = status.status === 'EXCEEDED' ? 'exceeded' : status.status === 'WARNING' ? 'warning' : 'on-track';
      const pct = Math.min(status.percentage, 100);
      const periodLabel = { MONTHLY: 'Hàng tháng', WEEKLY: 'Hàng tuần', YEARLY: 'Hàng năm' };

      return `
        <div class="budget-card">
          <div class="budget-header">
            <div class="budget-category">
              <span>${budget.category?.icon || '📂'}</span>
              <span>${budget.category?.name || 'N/A'}</span>
              <span class="badge badge-${statusClass}">${status.status === 'EXCEEDED' ? 'Vượt' : status.status === 'WARNING' ? 'Cảnh báo' : 'Ổn'}</span>
            </div>
            <div class="actions-cell">
              <button class="btn-icon danger" onclick="deleteBudget('${budget.id}')" title="Xóa"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="budget-amounts" style="margin-bottom:8px">
            <span class="spent">${formatCurrency(status.spent)}</span> / <span class="total">${formatCurrency(budget.amount)}</span>
          </div>
          <div class="progress-bar"><div class="progress-fill ${statusClass}" style="width:${pct}%"></div></div>
          <div class="budget-footer">
            <span>${periodLabel[budget.period] || budget.period} • ${formatDate(budget.startDate)} → ${formatDate(budget.endDate)}</span>
            <span>${status.percentage}%</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Lỗi: ${err.message}</p></div>`;
  }
}

function openBudgetModal() {
  document.getElementById('budgetModal').style.display = 'flex';
  document.getElementById('budgetModalTitle').textContent = 'Tạo ngân sách';
  document.getElementById('budgetId').value = '';
  document.getElementById('budgetAmount').value = '';
  document.getElementById('budgetPeriod').value = 'MONTHLY';

  // Default to current month
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  document.getElementById('budgetStartDate').value = `${year}-${month}-01`;
  document.getElementById('budgetEndDate').value = `${year}-${month}-${lastDay}`;
}

function closeBudgetModal() {
  document.getElementById('budgetModal').style.display = 'none';
}

async function saveBudget(e) {
  e.preventDefault();
  const data = {
    categoryId: document.getElementById('budgetCategory').value,
    amount: parseFloat(document.getElementById('budgetAmount').value),
    period: document.getElementById('budgetPeriod').value,
    startDate: document.getElementById('budgetStartDate').value,
    endDate: document.getElementById('budgetEndDate').value,
  };

  try {
    await API.createBudget(data);
    showToast('Đã tạo ngân sách mới');
    closeBudgetModal();
    loadBudgets();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteBudget(id) {
  if (!confirm('Bạn có chắc muốn xóa ngân sách này?')) return;
  try {
    await API.deleteBudget(id);
    showToast('Đã xóa ngân sách');
    loadBudgets();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===========================================
// INIT
// ===========================================
document.addEventListener('DOMContentLoaded', initApp);

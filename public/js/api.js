/**
 * API Client - handles all API calls with JWT auth
 */
const API = {
  baseUrl: '/api',

  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async request(method, path, data = null, queryParams = null) {
    let url = `${this.baseUrl}${path}`;

    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      const paramStr = params.toString();
      if (paramStr) url += `?${paramStr}`;
    }

    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const json = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          window.location.href = '/auth';
          return;
        }
        throw new Error(
          Array.isArray(json.message) ? json.message[0] : json.message || 'Something went wrong'
        );
      }

      return json.data !== undefined ? json.data : json;
    } catch (error) {
      throw error;
    }
  },

  // Auth
  login(email, password) {
    return this.request('POST', '/auth/login', { email, password });
  },
  register(email, password, fullName) {
    return this.request('POST', '/auth/register', { email, password, fullName });
  },
  getProfile() {
    return this.request('GET', '/auth/profile');
  },

  // Categories
  getCategories() {
    return this.request('GET', '/categories');
  },
  createCategory(data) {
    return this.request('POST', '/categories', data);
  },
  updateCategory(id, data) {
    return this.request('PATCH', `/categories/${id}`, data);
  },
  deleteCategory(id) {
    return this.request('DELETE', `/categories/${id}`);
  },

  // Transactions
  getTransactions(filters = {}) {
    return this.request('GET', '/transactions', null, filters);
  },
  getTransaction(id) {
    return this.request('GET', `/transactions/${id}`);
  },
  createTransaction(data) {
    return this.request('POST', '/transactions', data);
  },
  updateTransaction(id, data) {
    return this.request('PATCH', `/transactions/${id}`, data);
  },
  deleteTransaction(id) {
    return this.request('DELETE', `/transactions/${id}`);
  },

  // Budgets
  getBudgets() {
    return this.request('GET', '/budgets');
  },
  getBudgetStatus(id) {
    return this.request('GET', `/budgets/${id}/status`);
  },
  createBudget(data) {
    return this.request('POST', '/budgets', data);
  },
  updateBudget(id, data) {
    return this.request('PATCH', `/budgets/${id}`, data);
  },
  deleteBudget(id) {
    return this.request('DELETE', `/budgets/${id}`);
  },

  // Analytics
  getSummary(params = {}) {
    return this.request('GET', '/analytics/summary', null, params);
  },
  getByCategory(params = {}) {
    return this.request('GET', '/analytics/by-category', null, params);
  },
  getTrend(params = {}) {
    return this.request('GET', '/analytics/trend', null, params);
  },
  getBudgetOverview() {
    return this.request('GET', '/analytics/budget-overview');
  },

  // Notifications
  getNotifications() {
    return this.request('GET', '/notifications');
  },
  markAsRead(id) {
    return this.request('PATCH', `/notifications/${id}/read`);
  },
  markAllAsRead() {
    return this.request('PATCH', '/notifications/read-all');
  },
};

// Toast notification system
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { BudgetsService } from '../budgets/budgets.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private transactionsService: TransactionsService,
    private budgetsService: BudgetsService,
  ) {}

  async getSummary(userId: string, query: any) {
    const { startDate, endDate } = this.getDateRange(query);
    const totalIncome = await this.transactionsService.getSumByDateRange(userId, startDate, endDate, 'INCOME');
    const totalExpense = await this.transactionsService.getSumByDateRange(userId, startDate, endDate, 'EXPENSE');
    return {
      period: { startDate, endDate }, totalIncome, totalExpense,
      balance: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
    };
  }

  async getByCategory(userId: string, query: any) {
    const { startDate, endDate } = this.getDateRange(query);
    const type = query.type || 'EXPENSE';
    const breakdown = await this.transactionsService.getSumByCategory(userId, startDate, endDate, type);
    const total = breakdown.reduce((sum, item) => sum + parseFloat(item.total), 0);
    return breakdown.map((item) => ({
      categoryId: item.categoryId, categoryName: item.categoryName, categoryIcon: item.categoryIcon, categoryColor: item.categoryColor,
      total: parseFloat(item.total), count: parseInt(item.count, 10),
      percentage: total > 0 ? Math.round((parseFloat(item.total) / total) * 100) : 0,
    }));
  }

  async getTrend(userId: string, query: any) {
    const { year = new Date().getFullYear() } = query;
    const months = [];
    for (let month = 1; month <= 12; month++) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
      const income = await this.transactionsService.getSumByDateRange(userId, startDate, endDate, 'INCOME');
      const expense = await this.transactionsService.getSumByDateRange(userId, startDate, endDate, 'EXPENSE');
      months.push({ month, monthName: new Date(year, month - 1).toLocaleString('vi-VN', { month: 'long' }), income, expense, balance: income - expense });
    }
    return { year: Number(year), months };
  }

  async getBudgetOverview(userId: string) {
    const budgets = await this.budgetsService.findAll(userId);
    const overview = [];
    for (const budget of budgets) {
      if (budget.isActive) {
        const status = await this.budgetsService.getStatus(budget.id, userId);
        overview.push(status);
      }
    }
    return overview;
  }

  getDateRange(query: any) {
    const { period, month, year } = query;
    const now = new Date();
    const currentYear = year || now.getFullYear();
    const currentMonth = month || now.getMonth() + 1;
    let startDate, endDate;
    switch (period) {
      case 'WEEKLY': {
        const today = new Date(); const dayOfWeek = today.getDay();
        const start = new Date(today); start.setDate(today.getDate() - dayOfWeek + 1);
        const end = new Date(start); end.setDate(start.getDate() + 6);
        startDate = start.toISOString().split('T')[0]; endDate = end.toISOString().split('T')[0]; break;
      }
      case 'YEARLY': startDate = `${currentYear}-01-01`; endDate = `${currentYear}-12-31`; break;
      case 'MONTHLY': default: {
        const lastDay = new Date(currentYear, currentMonth, 0).getDate();
        startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${lastDay}`; break;
      }
    }
    return { startDate, endDate };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification } from './entities/notification.entity';
import { BudgetsService } from '../budgets/budgets.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private budgetsService: BudgetsService,
    private transactionsService: TransactionsService,
  ) {}

  async findAll(userId: string) {
    return this.notificationRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({ where: { id, userId } });
    if (!notification) return { message: 'Notification not found' };
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update({ userId, isRead: false } as any, { isRead: true } as any);
    return { message: 'All notifications marked as read' };
  }

  async remove(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({ where: { id, userId } });
    if (notification) await this.notificationRepository.remove(notification);
    return { message: 'Notification deleted' };
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkBudgets() {
    this.logger.log('Running daily budget check...');
    try {
      const activeBudgets = await this.budgetsService.getActiveBudgets();
      for (const budget of activeBudgets) {
        const categorySpent = await this.transactionsService
          .getSumByCategory(budget.userId, budget.startDate, budget.endDate, 'EXPENSE')
          .then((results) => { const match = results.find((r) => r.categoryId === budget.categoryId); return match ? parseFloat(match.total) : 0; });
        const percentage = parseFloat(budget.amount) > 0 ? Math.round((categorySpent / parseFloat(budget.amount)) * 100) : 0;
        if (percentage >= 100) await this.createBudgetNotification(budget.userId, 'BUDGET_EXCEEDED', `Vượt ngân sách: ${budget.category?.name}`, `Vượt ${percentage - 100}%`);
        else if (percentage >= 80) await this.createBudgetNotification(budget.userId, 'BUDGET_WARNING', `Cảnh báo: ${budget.category?.name}`, `Đã dùng ${percentage}%`);
      }
      this.logger.log(`Budget check completed. Checked ${activeBudgets.length} active budgets.`);
    } catch (error: any) { this.logger.error('Budget check failed:', error.message); }
  }

  async createBudgetNotification(userId: string, type: string, title: string, message: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existing = await this.notificationRepository.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId }).andWhere('notification.title = :title', { title }).andWhere('notification.createdAt >= :today', { today }).getOne();
    if (!existing) {
      const notification = this.notificationRepository.create({ userId, type, title, message } as any);
      await this.notificationRepository.save(notification);
    }
  }
}

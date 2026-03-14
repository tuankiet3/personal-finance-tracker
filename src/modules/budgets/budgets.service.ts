import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    private transactionsService: TransactionsService,
  ) {}

  async findAll(userId: string) {
    return this.budgetRepository.find({ where: { userId }, relations: ['category'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, userId: string) {
    const budget = await this.budgetRepository.findOne({ where: { id, userId }, relations: ['category'] });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async create(userId: string, createBudgetDto: any) {
    const budget = this.budgetRepository.create({ ...createBudgetDto, userId });
    const saved: any = await this.budgetRepository.save(budget);
    return this.findOne(saved.id, userId);
  }

  async update(id: string, userId: string, updateBudgetDto: any) {
    const budget = await this.findOne(id, userId);
    Object.assign(budget, updateBudgetDto);
    return this.budgetRepository.save(budget);
  }

  async remove(id: string, userId: string) {
    const budget = await this.findOne(id, userId);
    await this.budgetRepository.remove(budget);
    return { message: 'Budget deleted successfully' };
  }

  async getStatus(id: string, userId: string) {
    const budget = await this.findOne(id, userId);
    const categorySpent = await this.transactionsService
      .getSumByCategory(userId, budget.startDate, budget.endDate, 'EXPENSE')
      .then((results) => {
        const match = results.find((r) => r.categoryId === budget.categoryId);
        return match ? parseFloat(match.total) : 0;
      });
    const remaining = parseFloat(budget.amount) - categorySpent;
    const percentage = parseFloat(budget.amount) > 0 ? Math.round((categorySpent / parseFloat(budget.amount)) * 100) : 0;
    let status = 'ON_TRACK';
    if (percentage >= 100) status = 'EXCEEDED';
    else if (percentage >= 80) status = 'WARNING';
    return { budget, spent: categorySpent, remaining: Math.max(remaining, 0), percentage, status };
  }

  async getActiveBudgets() {
    const today = new Date().toISOString().split('T')[0];
    return this.budgetRepository.createQueryBuilder('budget')
      .leftJoinAndSelect('budget.category', 'category')
      .leftJoinAndSelect('budget.user', 'user')
      .where('budget.isActive = :isActive', { isActive: true })
      .andWhere('budget.startDate <= :today', { today })
      .andWhere('budget.endDate >= :today', { today })
      .getMany();
  }
}

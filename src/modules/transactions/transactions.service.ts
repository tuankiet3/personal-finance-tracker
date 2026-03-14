import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(userId: string, filterDto: any) {
    const { page = 1, limit = 20, type, categoryId, startDate, endDate } = filterDto;
    const qb = this.transactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.transactionDate', 'DESC')
      .addOrderBy('transaction.createdAt', 'DESC');

    if (type) qb.andWhere('transaction.type = :type', { type });
    if (categoryId) qb.andWhere('transaction.categoryId = :categoryId', { categoryId });
    if (startDate && endDate) qb.andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    else if (startDate) qb.andWhere('transaction.transactionDate >= :startDate', { startDate });
    else if (endDate) qb.andWhere('transaction.transactionDate <= :endDate', { endDate });

    const total = await qb.getCount();
    const transactions = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data: transactions, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.transactionRepository.findOne({ where: { id, userId }, relations: ['category'] });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async create(userId: string, createTransactionDto: any) {
    const transaction = this.transactionRepository.create({ ...createTransactionDto, userId });
    const saved: any = await this.transactionRepository.save(transaction);
    return this.findOne(saved.id, userId);
  }

  async update(id: string, userId: string, updateTransactionDto: any) {
    const transaction = await this.findOne(id, userId);
    Object.assign(transaction, updateTransactionDto);
    return this.transactionRepository.save(transaction);
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);
    await this.transactionRepository.remove(transaction);
    return { message: 'Transaction deleted successfully' };
  }

  async getSumByDateRange(userId: string, startDate: string, endDate: string, type: string) {
    const result = await this.transactionRepository.createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('transaction.type = :type', { type })
      .getRawOne();
    return parseFloat(result.total);
  }

  async getSumByCategory(userId: string, startDate: string, endDate: string, type: string) {
    return this.transactionRepository.createQueryBuilder('transaction')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('category.icon', 'categoryIcon')
      .addSelect('category.color', 'categoryColor')
      .addSelect('SUM(transaction.amount)', 'total')
      .addSelect('COUNT(transaction.id)', 'count')
      .leftJoin('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('transaction.type = :type', { type })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.icon')
      .addGroupBy('category.color')
      .orderBy('total', 'DESC')
      .getRawMany();
  }
}

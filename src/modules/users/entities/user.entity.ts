import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Budget } from '../../budgets/entities/budget.entity';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ type: 'varchar', unique: true })
  email;

  @Column({ type: 'varchar', select: false })
  password;

  @Column({ type: 'varchar', name: 'full_name' })
  fullName;

  @Column({ type: 'varchar', default: 'VND' })
  currency;

  @CreateDateColumn({ name: 'created_at' })
  createdAt;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt;

  @OneToMany(() => Category, (category) => category.user)
  categories;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions;

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications;
}

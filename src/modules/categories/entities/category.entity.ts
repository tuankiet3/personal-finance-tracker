import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Budget } from '../../budgets/entities/budget.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ type: 'varchar' })
  name;

  @Column({ type: 'simple-enum', enum: ['INCOME', 'EXPENSE'] })
  type;

  @Column({ type: 'varchar', nullable: true })
  icon;

  @Column({ type: 'varchar', nullable: true })
  color;

  @Column({ type: 'boolean', name: 'is_default', default: false })
  isDefault;

  @Column({ type: 'varchar', name: 'user_id' })
  userId;

  @CreateDateColumn({ name: 'created_at' })
  createdAt;

  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions;

  @OneToMany(() => Budget, (budget) => budget.category)
  budgets;
}

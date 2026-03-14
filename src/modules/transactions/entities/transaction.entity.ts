import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount;

  @Column({ type: 'simple-enum', enum: ['INCOME', 'EXPENSE'] })
  type;

  @Column({ type: 'varchar', nullable: true })
  description;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate;

  @Column({ type: 'varchar', name: 'category_id' })
  categoryId;

  @Column({ type: 'varchar', name: 'user_id' })
  userId;

  @CreateDateColumn({ name: 'created_at' })
  createdAt;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user;

  @ManyToOne(() => Category, (category) => category.transactions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category;
}

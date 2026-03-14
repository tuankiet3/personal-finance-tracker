import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount;

  @Column({ type: 'simple-enum', enum: ['MONTHLY', 'WEEKLY', 'YEARLY'] })
  period;

  @Column({ name: 'start_date', type: 'date' })
  startDate;

  @Column({ name: 'end_date', type: 'date' })
  endDate;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive;

  @Column({ type: 'varchar', name: 'category_id' })
  categoryId;

  @Column({ type: 'varchar', name: 'user_id' })
  userId;

  @CreateDateColumn({ name: 'created_at' })
  createdAt;

  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user;

  @ManyToOne(() => Category, (category) => category.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category;
}

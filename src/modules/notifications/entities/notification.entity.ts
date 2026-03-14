import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ type: 'varchar' })
  title;

  @Column({ type: 'text' })
  message;

  @Column({ type: 'simple-enum', enum: ['BUDGET_WARNING', 'BUDGET_EXCEEDED', 'SYSTEM'], default: 'SYSTEM' })
  type;

  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead;

  @Column({ type: 'varchar', name: 'user_id' })
  userId;

  @CreateDateColumn({ name: 'created_at' })
  createdAt;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user;
}

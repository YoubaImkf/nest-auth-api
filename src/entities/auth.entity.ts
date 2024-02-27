import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './users.entity';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @JoinColumn()
  @OneToOne(() => User)
  user: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;
}

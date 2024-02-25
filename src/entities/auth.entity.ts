import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsDate } from 'class-validator';
import { User } from './users.entity';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  @ManyToOne(() => User, (user) => user.id)
  user: string;

  @Column()
  @IsDate()
  createdAt: Date;
}

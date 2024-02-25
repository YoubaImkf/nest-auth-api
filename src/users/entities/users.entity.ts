import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsDate, IsEmail, IsStrongPassword, MinLength } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  @IsStrongPassword()
  @MinLength(10)
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @IsDate()
  @Column()
  createdAt: Date;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { AddUserDto } from 'src/dtos/addUser.dto';
import { UserDto } from '../dtos/user.dto';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAllAsync(): Promise<UserDto[]> {
    return await this.userRepository.find();
  }

  async getUserAsync(id: string): Promise<UserDto | null> {
    return await this.userRepository.findOneBy({ id });
  }

  async deleteUserAsync(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async addUserAsync(addUserDto: AddUserDto): Promise<User> {
    const validationErrors = await validate(addUserDto);
    if (validationErrors.length > 0) {
      throw new ValidationError();
    }
    const user: User = plainToInstance(User, addUserDto);
    return await this.userRepository.save(user);
  }

  async checkIfUserExistByEmail(email: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ email });
    if (user) return true;
    else return false;
  }
}

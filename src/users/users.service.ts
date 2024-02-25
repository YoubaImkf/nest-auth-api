import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { AddUserDto } from 'src/dtos/addUser.dto';
import { UserDto } from '../dtos/user.dto';
import { plainToInstance } from 'class-transformer';

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
    return this.userRepository.findOneBy({ id });
  }

  async deleteUserAsync(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async addUserAsync(addUserDto: AddUserDto): Promise<User> {
    const user: User = plainToInstance(User, addUserDto);
    return this.userRepository.save(user);
  }
}

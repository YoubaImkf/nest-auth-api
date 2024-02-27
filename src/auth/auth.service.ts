import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AddUserDto } from '../dtos/addUser.dto';
import * as argon2 from 'argon2';
import { tokenChars } from './constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../entities/auth.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/entities/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async register(addUserDto: AddUserDto): Promise<AddUserDto> {
    const hash = await this.hashData(addUserDto.password);
    const userExist = await this.usersService.checkIfUserExistByEmail(
      addUserDto.email,
    );

    if (!userExist) {
      const token = this.generateToken(90);
      const tokenHash = await this.encryptToken(token);

      const userCreated = await this.usersService.addUserAsync({
        ...addUserDto,
        password: hash,
      });
      await this.associateTokenToUserAndAdd(tokenHash, userCreated);

      return userCreated;
    }
  }

  //  async login(): Promise<{ access_token: string }> { }
  private generateToken(lenght: number): string {
    let token = '';
    for (let i = 0; i < lenght; i++) {
      const randomIndex = Math.floor(Math.random() * tokenChars.length);
      token += tokenChars[randomIndex];
    }
    return token;
  }

  private async associateTokenToUserAndAdd(
    token: string,
    user: User,
  ): Promise<void> {
    console.log(user);
    await this.authRepository.save({
      token: token,
      user: user.id,
    });
  }

  private async encryptToken(token: string): Promise<string> {
    return await this.hashData(token);
  }

  private async hashData(data: string): Promise<string> {
    return await argon2.hash(data);
  }
}

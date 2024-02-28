import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AddUserDto } from '../dtos/addUser.dto';
import * as argon2 from 'argon2';
import { tokenChars } from './constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../entities/auth.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/users.entity';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async register(addUserDto: AddUserDto): Promise<AddUserDto> {
    const hash = await this.hashData(addUserDto.password);
    const userExist = await this.usersService.getUserByEmail(addUserDto.email);

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

  async login(userLoginDto: LoginDto) {
    const userExist = await this.usersService.getUserByEmail(
      userLoginDto.email,
    );

    if (!userExist) throw new BadRequestException('User does not exist');

    const passwordMatches = await this.matchHash(
      userExist.password,
      userLoginDto.password,
    );

    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');

    return { access_token: await this.getTokens(userExist.id) };
  }

  // NOT WORKING ACTUALLY im not passing the clean token -_-
  async validateToken(token: string): Promise<boolean> {
    const auth = await this.authRepository.findOneBy({ token });
    if (!auth) {
      return false;
    }
    console.log(auth.token === token);
    return auth.token === token;
  }

  // ---Private methods---
  private async getTokens(userId: string): Promise<string | undefined> {
    const auth = await this.authRepository.findOneBy({ user: { id: userId } });
    return auth?.token;
  }

  private async matchHash(notHashed: string, hash: string): Promise<boolean> {
    return await argon2.verify(notHashed, hash);
  }

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
    const auth = new Auth();
    auth.token = token;
    auth.user = user;
    await this.authRepository.save(auth);
  }

  private async encryptToken(token: string): Promise<string> {
    return await this.hashData(token);
  }

  private async hashData(data: string): Promise<string> {
    return await argon2.hash(data);
  }
}

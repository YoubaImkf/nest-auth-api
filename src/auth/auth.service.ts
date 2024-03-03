import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AddUserDto } from '../dtos/addUser.dto';
import * as argon2 from 'argon2';
import { tokenChars } from './constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../entities/auth.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/users.entity';
import { LoginDto } from '../dtos/login.dto';
import crc from 'crc';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  private readonly prefix = 'oat_';
  private readonly cookieName = 'user_id';

  constructor(
    private usersService: UsersService,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async register(addUserDto: AddUserDto): Promise<AddUserDto> {
    const hash = await this.hashData(addUserDto.password);
    const userExist = await this.usersService.getUserByEmail(addUserDto.email);

    if (!userExist) {
      return await this.usersService.addUserAsync({
        ...addUserDto,
        password: hash,
      });
    }
  }

  async login(userLoginDto: LoginDto, response: Response) {
    const user = await this.usersService.getUserByEmail(userLoginDto.email);

    if (!user) throw new NotFoundException();

    const passwordMatches = await this.matchHash(
      user.password,
      userLoginDto.password,
    );

    if (!passwordMatches)
      throw new BadRequestException('Credientials are incorrect');

    const plainToken = this.generateRandomString(90);

    const hashedToken = await this.generateTokenHash(plainToken);

    const encodedPlainToken = await this.encodeBase64(plainToken);
    const concatPrefixToken = this.prefix + encodedPlainToken;

    await this.storeToken(hashedToken, user);

    response.clearCookie(this.cookieName);
    response.cookie(this.cookieName, user.id, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 60 * 60 * 1000),
      secure: true,
    });

    return { access_token: concatPrefixToken };
  }

  async validateToken(
    token: string,
    @Req() request: Request,
  ): Promise<boolean> {
    console.log('auth-token: ' + token);

    if (!token.startsWith(this.prefix)) {
      return false;
    }

    const tokenWhithoutPrefix = token.substring(this.prefix.length);

    const plainToken = await this.decodeBase64(tokenWhithoutPrefix);

    const calculatedChecksum = this.calculateCheckSum(plainToken);
    const tokenwithchecksum = plainToken + calculatedChecksum;

    const cookieUserId = request.cookies['user_id'];

    const hashedToken = await this.getToken(cookieUserId);

    if (!hashedToken) {
      throw new UnauthorizedException();
    }

    const matchHash = await this.matchHash(hashedToken, tokenwithchecksum);

    return matchHash;
  }

  // ---Private methods---
  private async getToken(userId: string): Promise<string | undefined> {
    try {
      const auth = await this.authRepository.findOneBy({
        user: { id: userId },
      });
      console.log(auth.token);
      return auth?.token;
    } catch (error) {
      throw new Error('Error while fetching tokens.');
    }
  }

  private async generateTokenHash(plainToken: string): Promise<string> {
    const calculatedChecksum = this.calculateCheckSum(plainToken);
    const token = plainToken + calculatedChecksum;

    const hashToken = await this.hashData(token);

    return hashToken;
  }

  private async storeToken(hashedToken: string, user: User): Promise<void> {
    let auth = await this.authRepository.findOneBy({
      user: { id: user.id },
    });

    if (auth) {
      auth.token = hashedToken;
    } else {
      auth = new Auth();
      auth.token = hashedToken;
      auth.user = user;
    }

    await this.authRepository.save(auth);
  }

  private generateRandomString(length: number): string {
    let token = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * tokenChars.length);
      token += tokenChars[randomIndex];
    }
    return token;
  }

  private calculateCheckSum(token: string): string {
    return crc.crc32(token).toString(16);
  }

  private async encodeBase64(token: string): Promise<string> {
    try {
      return Buffer.from(token).toString('base64');
    } catch (error) {
      throw new Error('Error encoding token to base64.');
    }
  }

  private async decodeBase64(token: string): Promise<string> {
    return Buffer.from(token, 'base64').toString('ascii');
  }

  private async matchHash(hash: string, notHashed: string): Promise<boolean> {
    return await argon2.verify(hash, notHashed);
  }

  private async hashData(data: string): Promise<string> {
    return await argon2.hash(data);
  }
}

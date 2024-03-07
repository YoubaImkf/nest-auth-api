import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AddUserDto } from '../dtos/addUser.dto';
import * as argon2 from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../entities/auth.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/users.entity';
import { LoginDto } from '../dtos/login.dto';
import { tokenConstants } from './constants';
import crc from 'crc';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async register(addUserDto: AddUserDto): Promise<AddUserDto> {
    const hash = await this.hashPassword(addUserDto.password);
    const userExist = await this.usersService.getUserByEmail(addUserDto.email);

    if (!userExist) {
      return await this.usersService.addUserAsync({
        ...addUserDto,
        password: hash,
      });
    }
  }

  async login(userLoginDto: LoginDto) {
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
    const concatPrefixToken = tokenConstants.prefix + encodedPlainToken;

    await this.saveOrUpdate(hashedToken, user);

    return { access_token: concatPrefixToken };
  }

  async validateToken(token: string): Promise<boolean> {
    if (!token.startsWith(tokenConstants.prefix)) {
      return false;
    }

    const tokenWhithoutPrefix = token.substring(tokenConstants.prefix.length);
    const plainToken = await this.decodeBase64(tokenWhithoutPrefix);

    const hashedToken = await this.generateTokenHash(plainToken);
    const tokenInDatabse = await this.getToken(hashedToken);

    if (!tokenInDatabse) {
      throw new UnauthorizedException();
    }

    return await this.matchHash(tokenInDatabse, plainToken);
  }

  /**
   * --- Private methods ---
   */
  private async getToken(token: string): Promise<string | undefined> {
    try {
      const auth = await this.authRepository.findOneBy({
        token: token,
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

    return await this.hashToken(token);
  }

  private async saveOrUpdate(hashedToken: string, user: User): Promise<void> {
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
      const randomIndex = Math.floor(
        Math.random() * tokenConstants.Chars.length,
      );
      token += tokenConstants.Chars[randomIndex];
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

  private async hashPassword(data: string): Promise<string> {
    return await argon2.hash(data);
  }

  private async hashToken(data: string): Promise<string> {
    return await argon2.hash(data, { salt: Buffer.from(tokenConstants.salt) });
  }
}

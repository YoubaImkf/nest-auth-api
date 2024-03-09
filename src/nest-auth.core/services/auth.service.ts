import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AddUserDto } from '../dtos/addUser.dto';
import { UserDto } from '../dtos/user.dto';
import * as argon2 from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../entities/auth.entity';
import { Repository } from 'typeorm';
import { User } from 'src/nest-auth.core/entities/users.entity';
import { LoginDto } from '../dtos/login.dto';
import { tokenConstants } from '../constants/token.constants';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
    private tokenService: TokenService,
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

  async login(userLoginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.getUserByEmail(userLoginDto.email);

    if (!user) throw new NotFoundException();

    const passwordMatches = await this.matchHash(
      user.password,
      userLoginDto.password,
    );

    if (!passwordMatches)
      throw new BadRequestException('Credentials are incorrect');

    const plainToken = this.tokenService.generateRandomString(180);
    const hashedToken = await this.tokenService.generateTokenHash(plainToken);

    const encodedPlainToken = await this.tokenService.encodeBase64(plainToken);
    const concatPrefixToken = tokenConstants.prefix + encodedPlainToken;

    await this.saveOrUpdate(hashedToken, user);

    return { access_token: concatPrefixToken };
  }

  async validateToken(tokenInput: string): Promise<UserDto> {
    if (!tokenInput.startsWith(tokenConstants.prefix)) {
      throw new UnauthorizedException();
    }

    const tokenWithoutPrefix = tokenInput.substring(
      tokenConstants.prefix.length,
    );
    const plainToken = await this.tokenService.decodeBase64(tokenWithoutPrefix);

    const hashedToken = await this.tokenService.generateTokenHash(plainToken);
    const auth = await this.getToken(hashedToken);
    const user = await this.getUserByToken(hashedToken);

    const expiredBoolean = await this.tokenService.isTokenExpired(
      auth.expiresAt,
    );

    if (!expiredBoolean) {
      throw new UnauthorizedException();
    }
    const verifyPasswordBoolean = await this.matchHash(auth.token, plainToken);

    if (!verifyPasswordBoolean) {
      new UnauthorizedException();
    }

    return user;
  }

  /** **********************
   * --- Private methods ---
   ** **********************/
  private async getToken(
    token: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const auth = await this.authRepository.findOneBy({
      token: token,
    });

    if (!auth.token || !auth.expiresAt) {
      throw new UnauthorizedException();
    }

    return {
      token: auth.token,
      expiresAt: auth.expiresAt,
    };
  }

  async getUserByToken(token: string): Promise<UserDto | undefined> {
    const auth = await this.authRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    return this.mapUserToDto(auth.user);
  }

  private mapUserToDto(user: User): UserDto {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  private async saveOrUpdate(hashedToken: string, user: User): Promise<void> {
    let auth = await this.authRepository.findOneBy({
      user: { id: user.id },
    });

    if (auth) {
      auth.token = hashedToken;
      auth.expiresAt = this.tokenService.setExpirationDate(1);
    } else {
      auth = new Auth();
      auth.token = hashedToken;
      auth.expiresAt = this.tokenService.setExpirationDate(1);
      auth.user = user;
    }

    await this.authRepository.save(auth);
  }

  private async matchHash(hash: string, notHashed: string): Promise<boolean> {
    return await argon2.verify(hash, notHashed);
  }

  private async hashPassword(data: string): Promise<string> {
    return await argon2.hash(data);
  }
}

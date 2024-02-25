import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AddUserDto } from '../dtos/addUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(addUserDto: AddUserDto): Promise<AddUserDto> {
    return await this.usersService.addUserAsync(addUserDto);
  }

  //  async signIn(
  //    username: string,
  //    pass: string,
  //  ): Promise<{ access_token: string }> {
  //    const user = await this.usersService.findOne(username);
  //    if (user?.password !== pass) {
  //      throw new NotFoundException();
  //    }
  //    const payload = { sub: user.userId, username: user.username };
  //    return {
  //      access_token: await this.jwtService.signAsync(payload),
  //    };
  //  }

  //
  //  async generateToken(): Promise<OauthToken> {}
}

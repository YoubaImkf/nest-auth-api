import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { AddUserDto } from '../dtos/addUser.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  signIn(@Body() addUserDto: AddUserDto): Promise<AddUserDto> {
    return this.authService.register(addUserDto);
  }
}

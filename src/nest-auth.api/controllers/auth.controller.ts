import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../nest-auth.core/services/auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddUserDto } from '../dtos/addUser.dto';
import { AuthGuard } from '../guards/auth.guard';
import { LoginDto } from '../dtos/login.dto';

@ApiBearerAuth()
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() addUserDto: AddUserDto): Promise<AddUserDto> {
    return await this.authService.register(addUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('userinfo')
  getProfile(@Request() req) {
    return req.user;
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddUserDto } from '../dtos/addUser.dto';
import { AuthGuard } from './auth.guard';
import { LoginDto } from '../dtos/login.dto';
import { Response } from 'express';

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
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.login(loginDto, response);
  }

  @UseGuards(AuthGuard)
  @Get('userinfo')
  getProfile() {
    return 'Successfully get';
  }
}

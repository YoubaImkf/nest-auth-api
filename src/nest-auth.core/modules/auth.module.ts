import { Module } from '@nestjs/common';
import { AuthController } from '../../nest-auth.api/controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UsersModule } from './users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '../entities/auth.entity';
import { TokenModule } from './token.module';

@Module({
  imports: [UsersModule, TokenModule, TypeOrmModule.forFeature([Auth])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

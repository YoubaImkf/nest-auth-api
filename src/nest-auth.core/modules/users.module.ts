import { Module } from '@nestjs/common';
import { UsersService } from '../nest-auth.core/services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../nest-auth.core/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { TokenService } from '../nest-auth.core/services/token.service';

@Module({
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}

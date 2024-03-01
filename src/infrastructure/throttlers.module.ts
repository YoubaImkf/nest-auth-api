import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: +configService.get('THROTTLE_TTL'),
          limit: +configService.get('THROTTLE_LIMIT'),
        },
      ],
    }),
  ],
})
export class ThrottlersModule {}

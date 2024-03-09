import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './nest-auth.core/modules/auth.module';
import { ConfigModule } from './nest-auth.core/modules/config.module';
import { DatabaseModule } from './nest.auth.infrastructure/data/database.module';
import { AuthController } from './nest-auth.api/controllers/auth.controller';
import { logger } from './nest-auth.api/middlewares/logger.middleware';
import { ThrottlersModule } from './nest-auth.core/modules/throttlers.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.register({ folder: './config' }),
    ThrottlersModule,
    AuthModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes(AuthController);
  }
}

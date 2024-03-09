import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../nest-auth.core/entities/users.entity';
import { Auth } from '../../nest-auth.core/entities/auth.entity';
import { ConfigService } from '../../nest-auth.core/services/config.service';
import { ConfigModule } from '../../nest-auth.core/modules/config.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Auth],
        synchronize: true,
        extra: {
          trustServerCertificate: true,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

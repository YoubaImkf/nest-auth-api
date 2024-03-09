import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '../nest-auth.core/services/config.service';
import { ConfigOptionsInterface } from '../config/interfaces/configOptions.interface';
import { CONFIG_OPTIONS } from '../constants/config.constants';

@Global()
@Module({})
export class ConfigModule {
  static register(options: ConfigOptionsInterface): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        ConfigService,
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
      ],
      exports: [ConfigService],
    };
  }
}

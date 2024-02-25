import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigOptionsInterface } from './interfaces';
import { CONFIG_OPTIONS } from './constant';

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

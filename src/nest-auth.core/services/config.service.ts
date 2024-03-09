import { Inject, Injectable } from '@nestjs/common';
import { EnvConfigInterface } from '../config/interfaces/envConfig.interface';
import { ConfigOptionsInterface } from "../config/interfaces/configOptions.interface";
import { CONFIG_OPTIONS } from '../constants/config.constants';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfigInterface;

  constructor(@Inject(CONFIG_OPTIONS) options: ConfigOptionsInterface) {
    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}

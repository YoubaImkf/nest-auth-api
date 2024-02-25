import { Injectable } from '@nestjs/common';
import { ConfigService } from './config/config.service';

@Injectable()
export class AppService {
  private readonly helloMessage: string;

  constructor(configService: ConfigService) {
    this.helloMessage = configService.get('DB_DATABASE');
  }

  getHello(): string {
    return this.helloMessage;
  }
}

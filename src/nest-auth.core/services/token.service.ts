import { Injectable } from '@nestjs/common';
import { tokenConstants } from '../constants/token.constants';
import * as argon2 from 'argon2';
import crc from 'crc';

@Injectable()
export class TokenService {
  async generateTokenHash(plainToken: string): Promise<string> {
    const calculatedChecksum = this.calculateCheckSum(plainToken);
    const token = plainToken + calculatedChecksum;

    return await this.hashToken(token);
  }

  generateRandomString(length: number): string {
    let token = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(
        Math.random() * tokenConstants.Chars.length,
      );
      token += tokenConstants.Chars[randomIndex];
    }
    return token;
  }

  calculateCheckSum(token: string): string {
    return crc.crc32(token).toString(16);
  }

  async encodeBase64(token: string): Promise<string> {
    try {
      return Buffer.from(token).toString('base64');
    } catch (error) {
      throw new Error('Error encoding token to base64.');
    }
  }

  async decodeBase64(token: string): Promise<string> {
    return Buffer.from(token, 'base64').toString('ascii');
  }

  setExpirationDate(durationHours: number): Date {
    const now = new Date();
    const expirationTime = now.getTime() + durationHours * 60 * 60 * 1000;
    return new Date(expirationTime);
  }

  async isTokenExprired(expiresAt: Date): Promise<boolean> {
    const currentDate = new Date();
    return expiresAt > currentDate; // Returns true if the expiration date is in the future
  }

  /**
   * --- Private methods ---
   */
  private async hashToken(data: string): Promise<string> {
    return await argon2.hash(data, { salt: Buffer.from(tokenConstants.salt) });
  }
}

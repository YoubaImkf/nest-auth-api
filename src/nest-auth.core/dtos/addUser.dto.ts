import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class AddUserDto {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  firstName: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  @MinLength(10)
  password: string;
}

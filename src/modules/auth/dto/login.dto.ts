import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: any;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: any;
}

import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsString()
  @IsNotEmpty()
  currentPassword: any;

  @ApiProperty({ example: 'newPassword456', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: any;
}

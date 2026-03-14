import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyen Van B' })
  @IsOptional()
  @IsString()
  fullName: any;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency: any;
}

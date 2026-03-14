import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Ăn uống' })
  @IsOptional()
  @IsString()
  name: any;

  @ApiPropertyOptional({ example: '🍔' })
  @IsOptional()
  @IsString()
  icon: any;

  @ApiPropertyOptional({ example: '#FF5733' })
  @IsOptional()
  @IsString()
  color: any;
}

import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Ăn uống' })
  @IsString()
  @IsNotEmpty()
  name: any;

  @ApiProperty({ enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE' })
  @IsEnum(['INCOME', 'EXPENSE'])
  type: any;

  @ApiPropertyOptional({ example: '🍔' })
  @IsOptional()
  @IsString()
  icon: any;

  @ApiPropertyOptional({ example: '#FF5733' })
  @IsOptional()
  @IsString()
  color: any;
}

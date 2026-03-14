import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 75000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'Ăn tối gia đình' })
  @IsOptional()
  @IsString()
  description: any;

  @ApiPropertyOptional({ example: '2026-03-15' })
  @IsOptional()
  @IsDateString()
  transactionDate: string;

  @ApiPropertyOptional({ example: 'uuid-of-category' })
  @IsOptional()
  @IsString()
  categoryId: any;
}

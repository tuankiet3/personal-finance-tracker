import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({ example: 50000 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE' })
  @IsEnum(['INCOME', 'EXPENSE'])
  type: any;

  @ApiPropertyOptional({ example: 'Ăn trưa với đồng nghiệp' })
  @IsOptional()
  @IsString()
  description: any;

  @ApiProperty({ example: '2026-03-14' })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsNotEmpty()
  @IsString()
  categoryId: any;
}

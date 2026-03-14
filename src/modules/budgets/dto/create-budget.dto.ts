import { IsNotEmpty, IsNumber, IsEnum, IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  @ApiProperty({ example: 5000000 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['MONTHLY', 'WEEKLY', 'YEARLY'], example: 'MONTHLY' })
  @IsEnum(['MONTHLY', 'WEEKLY', 'YEARLY'])
  period: any;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  startDate: any;

  @ApiProperty({ example: '2026-03-31' })
  @IsDateString()
  endDate: any;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsNotEmpty()
  @IsString()
  categoryId: any;
}

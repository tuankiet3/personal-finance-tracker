import { IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateBudgetDto {
  @ApiPropertyOptional({ example: 6000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  startDate: any;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsOptional()
  @IsDateString()
  endDate: any;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive: boolean;
}

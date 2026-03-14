import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterTransactionDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['INCOME', 'EXPENSE'] })
  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE'])
  type: any;

  @ApiPropertyOptional({ example: 'uuid-of-category' })
  @IsOptional()
  @IsString()
  categoryId: any;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  startDate: any;

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString()
  endDate: any;
}

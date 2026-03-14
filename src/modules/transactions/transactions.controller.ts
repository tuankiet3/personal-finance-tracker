import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Transactions')
@Controller('api/transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions with filters' })
  async findAll(@CurrentUser('id') userId: string, @Query() filterDto: any) {
    return this.transactionsService.findAll(userId, filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.transactionsService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  async create(@CurrentUser('id') userId: string, @Body() createTransactionDto: any) {
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  async update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() updateTransactionDto: any) {
    return this.transactionsService.update(id, userId, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.transactionsService.remove(id, userId);
  }
}

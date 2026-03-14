import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Budgets')
@Controller('api/budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'List all budgets' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.budgetsService.findAll(userId);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get budget status' })
  async getStatus(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.budgetsService.getStatus(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a budget' })
  async create(@CurrentUser('id') userId: string, @Body() createBudgetDto: any) {
    return this.budgetsService.create(userId, createBudgetDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  async update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() updateBudgetDto: any) {
    return this.budgetsService.update(id, userId, updateBudgetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.budgetsService.remove(id, userId);
  }
}

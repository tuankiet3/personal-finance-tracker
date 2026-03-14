import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary' })
  async getSummary(@CurrentUser('id') userId: string, @Query() query: any) {
    return this.analyticsService.getSummary(userId, query);
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Get spending by category' })
  async getByCategory(@CurrentUser('id') userId: string, @Query() query: any) {
    return this.analyticsService.getByCategory(userId, query);
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get income/expense trend' })
  async getTrend(@CurrentUser('id') userId: string, @Query() query: any) {
    return this.analyticsService.getTrend(userId, query);
  }

  @Get('budget-overview')
  @ApiOperation({ summary: 'Get budget overview' })
  async getBudgetOverview(@CurrentUser('id') userId: string) {
    return this.analyticsService.getBudgetOverview(userId);
  }
}

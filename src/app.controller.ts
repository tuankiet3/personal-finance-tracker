import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('api')
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'personal-finance-tracker',
    };
  }
}

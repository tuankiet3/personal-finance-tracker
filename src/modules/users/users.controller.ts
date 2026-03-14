import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update profile' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() updateProfileDto: any) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Patch('password')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(@CurrentUser('id') userId: string, @Body() changePasswordDto: any) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }
}

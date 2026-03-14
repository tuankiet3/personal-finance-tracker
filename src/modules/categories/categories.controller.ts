import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Categories')
@Controller('api/categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.categoriesService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  async create(@CurrentUser('id') userId: string, @Body() createCategoryDto: any) {
    return this.categoriesService.create(userId, createCategoryDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  async update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() updateCategoryDto: any) {
    return this.categoriesService.update(id, userId, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.categoriesService.remove(id, userId);
  }
}

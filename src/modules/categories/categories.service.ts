import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

const DEFAULT_CATEGORIES = [
  { name: 'Lương', type: 'INCOME', icon: '💰', color: '#4CAF50' },
  { name: 'Thưởng', type: 'INCOME', icon: '🎁', color: '#8BC34A' },
  { name: 'Đầu tư', type: 'INCOME', icon: '📈', color: '#009688' },
  { name: 'Thu khác', type: 'INCOME', icon: '💵', color: '#00BCD4' },
  { name: 'Ăn uống', type: 'EXPENSE', icon: '🍔', color: '#FF5722' },
  { name: 'Di chuyển', type: 'EXPENSE', icon: '🚗', color: '#FF9800' },
  { name: 'Mua sắm', type: 'EXPENSE', icon: '🛒', color: '#E91E63' },
  { name: 'Giải trí', type: 'EXPENSE', icon: '🎮', color: '#9C27B0' },
  { name: 'Sức khỏe', type: 'EXPENSE', icon: '🏥', color: '#F44336' },
  { name: 'Giáo dục', type: 'EXPENSE', icon: '📚', color: '#3F51B5' },
  { name: 'Hóa đơn', type: 'EXPENSE', icon: '📄', color: '#607D8B' },
  { name: 'Chi khác', type: 'EXPENSE', icon: '💸', color: '#795548' },
];

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async seedDefaults(userId: string) {
    const categories = DEFAULT_CATEGORIES.map((cat) =>
      this.categoryRepository.create({ ...cat, userId, isDefault: true } as any),
    );
    await this.categoryRepository.save(categories as any);
  }

  async findAll(userId: string) {
    return this.categoryRepository.find({ where: { userId }, order: { type: 'ASC', name: 'ASC' } });
  }

  async findOne(id: string, userId: string) {
    const category = await this.categoryRepository.findOne({ where: { id, userId } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(userId: string, createCategoryDto: any) {
    const category = this.categoryRepository.create({ ...createCategoryDto, userId });
    return this.categoryRepository.save(category);
  }

  async update(id: string, userId: string, updateCategoryDto: any) {
    const category = await this.findOne(id, userId);
    if (category.isDefault) throw new ForbiddenException('Cannot modify default categories');
    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string, userId: string) {
    const category = await this.findOne(id, userId);
    if (category.isDefault) throw new ForbiddenException('Cannot delete default categories');
    await this.categoryRepository.remove(category);
    return { message: 'Category deleted successfully' };
  }
}

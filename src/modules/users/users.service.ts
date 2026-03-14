import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateProfile(userId: string, updateProfileDto: any) {
    await this.userRepository.update(userId, updateProfileDto);
    return this.findById(userId);
  }

  async changePassword(userId: string, changePasswordDto: any) {
    const { currentPassword, newPassword } = changePasswordDto;
    const user = await this.userRepository.createQueryBuilder('user').addSelect('user.password').where('user.id = :id', { id: userId }).getOne();
    const isValid = await compare(currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Current password is incorrect');
    const hashedPassword = await hash(newPassword, 12);
    await this.userRepository.update(userId, { password: hashedPassword } as any);
    return { message: 'Password changed successfully' };
  }
}

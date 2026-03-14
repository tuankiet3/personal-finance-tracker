import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private categoriesService: CategoriesService,
  ) {}

  async register(registerDto) {
    const { email, password, fullName } = registerDto;
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) throw new ConflictException('Email already registered');

    const hashedPassword = await hash(password, 12);
    const user = this.userRepository.create({ email, password: hashedPassword, fullName });
    const savedUser = await this.userRepository.save(user);
    await this.categoriesService.seedDefaults(savedUser.id);

    const token = this.generateToken(savedUser);
    return {
      user: { id: savedUser.id, email: savedUser.email, fullName: savedUser.fullName, currency: savedUser.currency },
      accessToken: token,
    };
  }

  async login(loginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.createQueryBuilder('user').addSelect('user.password').where('user.email = :email', { email }).getOne();
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user);
    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, currency: user.currency },
      accessToken: token,
    };
  }

  async getProfile(userId) {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  generateToken(user) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 获取所有用户
  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 获取单个用户
  findOne(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  // 创建用户
  create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  // 更新用户
  async update(id: number, user: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ id });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.userRepository.merge(existingUser, user);
    return this.userRepository.save(existingUser);
  }

  // 删除用户
  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // 批量删除用户
  async removeMultiple(ids: number[]): Promise<number> {
    // 去重
    const uniqueIds = [...new Set(ids)];
    const result = await this.userRepository.delete(uniqueIds);
    return result.affected || 0;
  }
}
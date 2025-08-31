import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 获取所有用户
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // 获取单个用户
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // 创建用户
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() user: User) {
    return this.userService.create(user);
  }

  // 更新用户
  @Put(':id')
  update(@Param('id') id: string, @Body() user: User) {
    return this.userService.update(+id, user);
  }

  // 删除用户
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  // 批量删除用户
  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  async batchRemove(@Body() payload: { ids: number[] }) {
    // 验证请求体
    if (!payload || !payload.ids || !Array.isArray(payload.ids)) {
      throw new BadRequestException('Invalid payload format. Expected {"ids": [number[]]}');
    }

    // 验证ID数组
    const validIds = payload.ids.filter(id => Number.isInteger(id) && id > 0);
    if (validIds.length === 0) {
      throw new BadRequestException('No valid user IDs provided');
    }

    try {
      const deletedCount = await this.userService.removeMultiple(validIds);
      return { success: true, deletedCount };
    } catch (error) {
      throw new BadRequestException('Failed to delete users: ' + error.message);
    }
  }
}
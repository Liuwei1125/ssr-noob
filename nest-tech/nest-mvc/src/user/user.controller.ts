import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.interface';
import { CreateUserDto, UpdateUserDto, UserIdParam } from './user.dto';
import { BadRequestException } from '@nestjs/common';

@Controller('users/api')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // REST API - 获取所有用户（JSON格式）
  @Get()
  findAll(): User[] {
    return this.userService.findAll();
  }

  // REST API - 获取单个用户（JSON格式）
  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  findOne(@Param() params: UserIdParam): User {
    return this.userService.findOne(params.id);
  }

  // REST API - 创建用户
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() user: CreateUserDto): User {
    return this.userService.create(user);
  }

  // REST API - 更新用户（JSON格式）
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param() params: UserIdParam, @Body() user: UpdateUserDto): User {
    return this.userService.update(params.id, user);
  }

  // REST API - 删除用户（JSON格式）
  @Delete(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  remove(@Param() params: UserIdParam): User {
    return this.userService.remove(params.id);
  }
  
  // REST API - 批量删除用户
  @Post('batch-delete')
  @UsePipes(new ValidationPipe({ transform: true }))
  batchRemove(@Body() body: { ids: number[] }): User[] {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('请提供要删除的用户ID列表');
    }
    return this.userService.removeMultiple(body.ids);
  }
}
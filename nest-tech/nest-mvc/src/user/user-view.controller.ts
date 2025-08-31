import { Controller, Get, Post, Res, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.interface';
import { Response } from 'express';
import { UserIdParam, UpdateUserDto } from './user.dto';

@Controller('users')
export class UserViewController {
    constructor(private readonly userService: UserService) { }

    // MVC - 渲染用户列表视图
    @Get()
    async renderUserList(@Res() res: Response) {
        const users = this.userService.findAll();
        return res.render('userList', { users });
    }

    // MVC - 渲染添加用户表单
    @Get('add')
    async renderAddUserForm(@Res() res: Response) {
        return res.render('addUser');
    }

    // MVC - 渲染编辑用户表单
    @Get(':id/edit')
    @UsePipes(new ValidationPipe({ transform: true }))
    async renderEditUserForm(@Param() params: UserIdParam, @Res() res: Response) {
        const user = this.userService.findOne(params.id);
        if (user) {
            return res.render('editUser', { user });
        } else {
            return res.status(404).render('error', { message: '用户不存在' });
        }
    }

    // 处理表单提交 - 删除用户
    @Post(':id/delete')
    @UsePipes(new ValidationPipe({ transform: true }))
    async deleteUserForm(@Param() params: UserIdParam, @Res() res: Response) {
        const deletedUser = this.userService.remove(params.id);
        if (deletedUser) {
            return res.redirect('/users');
        } else {
            return res.status(404).render('error', { message: '用户不存在' });
        }
    }

    // MVC - 渲染用户详情视图
    @Get(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async renderUserDetail(@Param() params: UserIdParam, @Res() res: Response) {
        const user = this.userService.findOne(params.id);
        if (user) {
            return res.render('userDetail', { user });
        } else {
            return res.status(404).render('error', { message: '用户不存在' });
        }
    }

    // 处理表单提交 - 添加/更新用户
    @Post()
    async handleFormSubmission(@Body() body: any, @Res() res: Response) {
        // 检查是否是表单提交还是API请求
        if (body._method === undefined) {
            // 表单提交 - 添加用户
            const newUser = this.userService.create({
                name: body.name,
                age: parseInt(body.age, 10),
                email: body.email
            });
            return res.redirect('/users');
        } else if (body._method === 'PUT') {
            // 表单提交 - 更新用户
            const { _method, ...updatedData } = body;
            // 确保年龄被转换为数字
            if (updatedData.age) {
                updatedData.age = parseInt(updatedData.age, 10);
            }
            const userId = parseInt(body.id, 10);
            const updatedUser = this.userService.update(userId, updatedData);
            return res.redirect('/users');
        }
    }
}
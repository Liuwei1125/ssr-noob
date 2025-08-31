import { Module, NestModule, MiddlewareConsumer, NotFoundException, HttpException } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { join } from 'path';
import * as express from 'express';
import { UserService } from './user/user.service';
import { User } from './user/user.interface';

@Module({
  imports: [UserModule],
  providers: [
    {
      provide: APP_FILTER,
      useValue: {
        catch(exception, host) {
          const ctx = host.switchToHttp();
          const response = ctx.getResponse();
          const request = ctx.getRequest();
          
          if (exception instanceof NotFoundException) {
            response.status(404).render('error', { message: '页面未找到' });
            return;
          }
          
          response.status(500).render('error', { message: '服务器内部错误' });
        },
      },
    },
    // 为UserService提供初始数据
    {
      provide: 'INITIAL_USERS',
      useValue: [
        {
          id: 1,
          name: '张三',
          age: 28,
          email: 'zhangsan@example.com'
        },
        {
          id: 2,
          name: '李四',
          age: 32,
          email: 'lisi@example.com'
        },
        {
          id: 3,
          name: '王五',
          age: 25,
          email: 'wangwu@example.com'
        }
      ] as User[]
    },
    // 自定义UserService提供者
    {
      provide: UserService,
      useFactory: (initialUsers: User[]) => {
        const service = new UserService();
        // 初始化用户数据
        initialUsers.forEach(user => {
          // 确保service有addInitialUser方法来添加初始用户
          if ((service as any).addInitialUser) {
            (service as any).addInitialUser(user);
          }
        });
        return service;
      },
      inject: ['INITIAL_USERS']
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 配置默认路由重定向到用户列表
    consumer
      .apply((req, res, next) => {
        if (req.path === '/') {
          return res.redirect('/users');
        }
        next();
      })
      .forRoutes('/'); // 只应用到根路径
  }
}
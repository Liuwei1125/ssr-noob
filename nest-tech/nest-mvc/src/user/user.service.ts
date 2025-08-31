import { Injectable } from '@nestjs/common';
import { User } from './user.interface';

@Injectable()
export class UserService {
  private users: User[] = [];
  private nextId = 1;

  constructor() {
    // 构造函数中初始化一些示例数据，以防初始数据提供者未生效
    if (this.users.length === 0) {
      this.addInitialUser({
        id: 1,
        name: '张三',
        age: 28,
        email: 'zhangsan@example.com'
      });
      this.addInitialUser({
        id: 2,
        name: '李四',
        age: 32,
        email: 'lisi@example.com'
      });
      this.addInitialUser({
        id: 3,
        name: '王五',
        age: 25,
        email: 'wangwu@example.com'
      });
    }
  }

  // 添加初始用户的方法（用于模块初始化时）
  addInitialUser(user: User): void {
    // 检查用户是否已存在
    const existingUser = this.users.find(u => u.id === user.id);
    if (!existingUser) {
      this.users.push(user);
      // 更新nextId，确保新创建的用户ID不会冲突
      this.nextId = Math.max(this.nextId, user.id + 1);
    }
  }

  // 获取所有用户
  findAll(): User[] {
    return this.users;
  }

  // 根据ID获取用户
  findOne(id: number): User {
    return this.users.find(user => user.id === id);
  }

  // 创建新用户
  create(user: Omit<User, 'id'>): User {
    const newUser = {
      ...user,
      id: this.nextId++
    };
    this.users.push(newUser);
    return newUser;
  }

  // 更新用户
  update(id: number, updateUser: Partial<User>): User {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return null;
    }
    
    // 创建不包含id的更新数据对象，防止id被意外修改
    const { id: _, ...safeUpdateData } = updateUser;
    
    this.users[index] = {
      ...this.users[index],
      ...safeUpdateData
    };
    
    return this.users[index];
  }

  // 删除用户
  remove(id: number): User {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return null;
    }
    
    const deletedUser = this.users[index];
    this.users.splice(index, 1);
    
    return deletedUser;
  }
  
  // 批量删除用户
  removeMultiple(ids: number[]): User[] {
    const deletedUsers: User[] = [];
    
    // 过滤出要删除的用户
    const idsToDelete = [...new Set(ids)]; // 去重
    
    // 从数组末尾开始删除，避免索引变化问题
    for (let i = this.users.length - 1; i >= 0; i--) {
      if (idsToDelete.includes(this.users[i].id)) {
        deletedUsers.unshift(this.users[i]); // 保持原始顺序
        this.users.splice(i, 1);
      }
    }
    
    return deletedUsers;
  }
}
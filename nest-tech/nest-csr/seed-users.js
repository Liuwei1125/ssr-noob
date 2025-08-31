// 脚本用于向数据库添加初始用户数据
const axios = require('axios');

// API基础URL
const API_URL = 'http://localhost:3000/api/users';

// 初始用户数据
const initialUsers = [
  {
    name: '张三',
    email: 'zhangsan@example.com',
    age: 25
  },
  {
    name: '李四',
    email: 'lisi@example.com',
    age: 30
  },
  {
    name: '王五',
    email: 'wangwu@example.com',
    age: 35
  },
  {
    name: '赵六',
    email: 'zhaoliu@example.com',
    age: 28
  },
  {
    name: '钱七',
    email: 'qianqi@example.com',
    age: 40
  }
];

// 添加用户到数据库
async function addUsers() {
  try {
    console.log('开始添加初始用户数据...');
    
    // 清空现有用户数据（可选）
    // await axios.delete(`${API_URL}/all`);
    // console.log('已清空现有用户数据');
    
    const addedUsers = [];
    for (const user of initialUsers) {
      try {
        const response = await axios.post(API_URL, user);
        addedUsers.push(response.data);
        console.log(`成功添加用户: ${user.name}`);
      } catch (err) {
        console.error(`添加用户 ${user.name} 失败:`, err.message);
      }
    }
    
    console.log(`\n初始用户数据添加完成。成功添加 ${addedUsers.length} 个用户。`);
    console.log('用户列表:');
    addedUsers.forEach(user => {
      console.log(`- ID: ${user.id}, 姓名: ${user.name}, 邮箱: ${user.email}, 年龄: ${user.age}`);
    });
  } catch (error) {
    console.error('操作失败:', error.message);
    console.error('请确保后端服务器已启动并运行在 http://localhost:3000/');
  }
}

// 执行脚本
addUsers();
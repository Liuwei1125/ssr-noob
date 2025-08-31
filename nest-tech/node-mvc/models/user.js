// User 数据模型

// 模拟数据库
let users = [
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com' },
  { id: 3, name: '王五', age: 28, email: 'wangwu@example.com' }
];

// 获取所有用户
exports.getAllUsers = function() {
  return users;
};

// 根据ID获取用户
exports.getUserById = function(id) {
  return users.find(user => user.id === parseInt(id));
};

// 添加新用户
exports.addUser = function(user) {
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newUser = {
    id: newId,
    name: user.name,
    age: parseInt(user.age),
    email: user.email
  };
  users.push(newUser);
  return newUser;
};

// 更新用户
exports.updateUser = function(id, updatedUser) {
  const index = users.findIndex(user => user.id === parseInt(id));
  if (index !== -1) {
    users[index] = {
      ...users[index],
      name: updatedUser.name || users[index].name,
      age: updatedUser.age ? parseInt(updatedUser.age) : users[index].age,
      email: updatedUser.email || users[index].email
    };
    return users[index];
  }
  return null;
};

// 删除用户
exports.deleteUser = function(id) {
  const index = users.findIndex(user => user.id === parseInt(id));
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  return null;
};
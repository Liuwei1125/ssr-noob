// User 控制器
const userModel = require('../models/user');

// 获取所有用户
exports.getAllUsers = function(req, res) {
  const users = userModel.getAllUsers();
  res.render('userList', { users: users });
};

// 获取单个用户详情
exports.getUserById = function(req, res) {
  const user = userModel.getUserById(req.params.id);
  if (user) {
    res.render('userDetail', { user: user });
  } else {
    res.status(404).send('用户不存在');
  }
};

// 显示添加用户表单
exports.showAddUserForm = function(req, res) {
  res.render('addUser');
};

// 添加新用户
exports.addUser = function(req, res) {
  const newUser = userModel.addUser(req.body);
  res.redirect('/users');
};

// 显示编辑用户表单
exports.showEditUserForm = function(req, res) {
  const user = userModel.getUserById(req.params.id);
  if (user) {
    res.render('editUser', { user: user });
  } else {
    res.status(404).send('用户不存在');
  }
};

// 更新用户
exports.updateUser = function(req, res) {
  const updatedUser = userModel.updateUser(req.params.id, req.body);
  if (updatedUser) {
    res.redirect('/users');
  } else {
    res.status(404).send('用户不存在');
  }
};

// 删除用户
exports.deleteUser = function(req, res) {
  const deletedUser = userModel.deleteUser(req.params.id);
  if (deletedUser) {
    res.redirect('/users');
  } else {
    res.status(404).send('用户不存在');
  }
};
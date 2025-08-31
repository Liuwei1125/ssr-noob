// 导入Express和相关模块
const express = require('express');
const path = require('path');
const userController = require('./controllers/userController');

// 创建Express应用实例
const app = express();

// 设置端口
const PORT = process.env.PORT || 3000;

// 设置视图引擎为EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 配置中间件
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体

// 设置路由
app.get('/', (req, res) => {
  res.redirect('/users');
});

// 用户相关路由
// 静态路由优先于动态路由
// app.get('/users', userController.getAllUsers);
// app.get('/users/add', userController.showAddUserForm);
// app.post('/users/add', userController.addUser);
// app.get('/users/:id', userController.getUserById);
// app.get('/users/:id/edit', userController.showEditUserForm);
// app.post('/users/:id/edit', userController.updateUser);
// app.post('/users/:id/delete', userController.deleteUser);

// 引入用户路由
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`MVC演示应用已启动，正在监听端口 ${PORT}`);
  console.log(`请访问 http://localhost:${PORT} 查看应用`);
});
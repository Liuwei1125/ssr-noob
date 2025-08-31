// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.get('/add', userController.showAddUserForm);
router.post('/add', userController.addUser);
router.get('/:id', userController.getUserById);
router.get('/:id/edit', userController.showEditUserForm);
router.post('/:id/edit', userController.updateUser);
router.post('/:id/delete', userController.deleteUser);

// ... 其他路由

module.exports = router;

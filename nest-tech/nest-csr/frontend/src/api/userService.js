import axios from 'axios';

// 创建axios实例，设置基础URL
const api = axios.create({
  baseURL: 'http://localhost:3000/api/users', // 后端API的基础URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 获取所有用户
export const getUsers = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
};

// 获取单个用户
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`获取ID为${id}的用户失败:`, error);
    throw error;
  }
};

// 创建用户
export const createUser = async (userData) => {
  try {
    const response = await api.post('/', userData);
    return response.data;
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
};

// 更新用户
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`更新ID为${id}的用户失败:`, error);
    throw error;
  }
};

// 删除用户
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`删除ID为${id}的用户失败:`, error);
    throw error;
  }
};

// 批量删除用户
export const batchDeleteUsers = async (ids) => {
  try {
    const response = await api.post('/batch-delete', { ids });
    return response.data;
  } catch (error) {
    console.error('批量删除用户失败:', error);
    throw error;
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
};
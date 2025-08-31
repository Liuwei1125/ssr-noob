import React, { useState } from 'react';
import { createUser } from '../api/userService';
import './AddUserForm.css';

const AddUserForm = ({ onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误和成功消息
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // 表单验证
      if (!formData.name.trim()) {
        throw new Error('请输入姓名');
      }
      if (!formData.email.trim()) {
        throw new Error('请输入邮箱');
      }
      if (!isValidEmail(formData.email)) {
        throw new Error('请输入有效的邮箱地址');
      }
      if (!formData.age || isNaN(formData.age) || parseInt(formData.age) < 0) {
        throw new Error('请输入有效的年龄');
      }

      // 提交数据到后端
      const newUser = await createUser({
        ...formData,
        age: parseInt(formData.age)
      });

      setSuccess('用户添加成功！');
      // 重置表单
      setFormData({ name: '', email: '', age: '' });
      // 通知父组件用户已添加
      if (onUserAdded) {
        onUserAdded(newUser);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email);
  };

  return (
    <div className="add-user-form">
      <h2>添加新用户</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">姓名</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="请输入姓名"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">邮箱</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="请输入邮箱"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">年龄</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="请输入年龄"
            min="0"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '添加中...' : '添加用户'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
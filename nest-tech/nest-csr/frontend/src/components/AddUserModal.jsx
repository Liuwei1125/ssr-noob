import React, { useState } from 'react';
import Modal from './Modal';
import { useUserStore } from '../store/userStore';

const AddUserModal = ({ isOpen, onClose }) => {
  // 使用Zustand状态管理
  const { createUser } = useUserStore();
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

      // 重置表单
      setFormData({ name: '', email: '', age: '' });
      
      // 用户已通过store添加，这里只需要重置表单和关闭模态框
      setFormData({ name: '', email: '', age: '' });
      onClose();
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

  // 在关闭模态框时重置表单
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', email: '', age: '' });
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="添加新用户"
    >
      {error && <div className="error-message">{error}</div>}
      
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
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting}
            className="cancel-btn"
          >
            取消
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="submit-btn"
          >
            {isSubmitting ? '添加中...' : '添加用户'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal;
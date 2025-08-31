import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import Modal from './Modal';
import AddUserModal from './AddUserModal';
import './UserList.css';

const UserList = () => {
  // 使用Zustand状态管理
  const {
    users,
    loading,
    error,
    fetchUsers,
    deleteUser,
    batchDeleteUsers,
    updateUser,
    searchTerm,
    setSearchTerm,
    sortConfig,
    setSortConfig
  } = useUserStore();
  
  // UI状态仍然保留在组件内部
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    age: ''
  });
  const [editFormError, setEditFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 搜索功能
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 排序功能
  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...filteredUsers];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  // 处理排序
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 处理选择用户
  const handleUserSelect = (userId) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (newSelectedUsers.has(userId)) {
      newSelectedUsers.delete(userId);
    } else {
      newSelectedUsers.add(userId);
    }
    setSelectedUsers(newSelectedUsers);
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectedUsers.size === sortedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      const allUserIds = new Set(sortedUsers.map(user => user.id));
      setSelectedUsers(allUserIds);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedUsers.size === 0) {
      alert('请至少选择一个用户');
      return;
    }

    if (!window.confirm(`确定要删除选中的 ${selectedUsers.size} 个用户吗？`)) {
      return;
    }

    try {
      await batchDeleteUsers(Array.from(selectedUsers));
      alert(`成功删除了选中的用户`);
      setSelectedUsers(new Set());
    } catch (err) {
      alert('批量删除失败：' + (err.response?.data?.message || err.message));
    }
  };

  // 处理单个用户删除
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('确定要删除这个用户吗？')) {
      return;
    }

    try {
      await deleteUser(userId);
      alert('用户删除成功');
      
      // 如果该用户在选中列表中，也从选中列表中移除
      if (selectedUsers.has(userId)) {
        const newSelectedUsers = new Set(selectedUsers);
        newSelectedUsers.delete(userId);
        setSelectedUsers(newSelectedUsers);
      }
    } catch (err) {
      alert('删除失败：' + (err.response?.data?.message || err.message));
    }
  };

  // 处理用户查看
  const handleViewUser = (user) => {
    setCurrentUser(user);
    setIsViewModalOpen(true);
  };

  // 处理用户编辑
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      age: user.age.toString()
    });
    setEditFormError('');
    setIsEditModalOpen(true);
  };

  // 处理编辑表单变更
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setEditFormError('');
  };

  // 处理编辑表单提交
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditFormError('');

    try {
      // 表单验证
      if (!editFormData.name.trim()) {
        throw new Error('请输入姓名');
      }
      if (!editFormData.email.trim()) {
        throw new Error('请输入邮箱');
      }
      if (!isValidEmail(editFormData.email)) {
        throw new Error('请输入有效的邮箱地址');
      }
      if (!editFormData.age || isNaN(editFormData.age) || parseInt(editFormData.age) < 0) {
        throw new Error('请输入有效的年龄');
      }

      // 提交数据到后端
      await updateUser(currentUser.id, {
        ...editFormData,
        age: parseInt(editFormData.age)
      });

      setIsEditModalOpen(false);
    } catch (err) {
      setEditFormError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 邮箱验证函数
  const isValidEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email);
  };

  // 添加用户功能
  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  // 用户添加成功后的回调
  const handleUserAdded = (newUser) => {
    // 用户已通过store添加，这里只需要关闭模态框
    setIsAddModalOpen(false);
  };

  // 渲染排序图标
  const getSortIcon = (columnName) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return null;
    }
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  if (loading) {
    return (
      <div className="user-list-container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h1>用户列表</h1>
        <div className="user-list-actions">
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="action-buttons">
            <button
              onClick={handleAddUser}
              className="add-user-btn"
            >
              添加用户
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={selectedUsers.size === 0}
              className="batch-delete-btn"
            >
              删除选中 ({selectedUsers.size})
            </button>
          </div>
        </div>
      </div>
      
      {/* 查看用户模态框 */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="查看用户信息"
      >
        {currentUser && (
          <div className="user-info-container">
            <div className="user-info-item">
              <strong>ID:</strong> {currentUser.id}
            </div>
            <div className="user-info-item">
              <strong>姓名:</strong> {currentUser.name}
            </div>
            <div className="user-info-item">
              <strong>邮箱:</strong> {currentUser.email}
            </div>
            <div className="user-info-item">
              <strong>年龄:</strong> {currentUser.age}
            </div>
            <div className="user-info-item">
              <strong>创建时间:</strong> {new Date(currentUser.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>

      {/* 编辑用户模态框 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="编辑用户信息"
      >
        {editFormError && <div className="error-message">{editFormError}</div>}
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label htmlFor="edit-name">姓名</label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={editFormData.name}
              onChange={handleEditChange}
              placeholder="请输入姓名"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-email">邮箱</label>
            <input
              type="email"
              id="edit-email"
              name="email"
              value={editFormData.email}
              onChange={handleEditChange}
              placeholder="请输入邮箱"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-age">年龄</label>
            <input
              type="number"
              id="edit-age"
              name="age"
              value={editFormData.age}
              onChange={handleEditChange}
              placeholder="请输入年龄"
              min="0"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setIsEditModalOpen(false)}
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
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 添加用户模态框 */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
      
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={sortedUsers.length > 0 && selectedUsers.size === sortedUsers.length}
                  onChange={handleSelectAll}
                  disabled={sortedUsers.length === 0}
                />
              </th>
              <th onClick={() => requestSort('id')} className="sortable">
                ID{getSortIcon('id')}
              </th>
              <th onClick={() => requestSort('name')} className="sortable">
                姓名{getSortIcon('name')}
              </th>
              <th onClick={() => requestSort('email')} className="sortable">
                邮箱{getSortIcon('email')}
              </th>
              <th onClick={() => requestSort('age')} className="sortable">
                年龄{getSortIcon('age')}
              </th>
              <th onClick={() => requestSort('createdAt')} className="sortable">
                创建时间{getSortIcon('createdAt')}
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">暂无数据</td>
              </tr>
            ) : (
              sortedUsers.map(user => (
                <tr
                  key={user.id}
                  className={selectedUsers.has(user.id) ? 'selected' : ''}
                  onMouseEnter={(e) => e.currentTarget.classList.add('hovered')}
                  onMouseLeave={(e) => e.currentTarget.classList.remove('hovered')}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                    />
                  </td>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.age}</td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                  <td className="actions">
                    <button className="view-btn" onClick={() => handleViewUser(user)}>查看</button>
                    <button className="edit-btn" onClick={() => handleEditUser(user)}>编辑</button>
                    <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>删除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
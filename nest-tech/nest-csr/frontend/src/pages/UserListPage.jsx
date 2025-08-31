import React, { useEffect } from 'react';
import UserList from '../components/UserList';
import './UserListPage.css';

function UserListPage() {
  return (
    <div className="user-list-page">
      <div className="page-header">
        <h1>用户管理</h1>
        <p>查看、添加、编辑和删除用户信息</p>
      </div>
      
      <div className="user-list-container">
        <UserList />
      </div>
    </div>
  );
}

export default UserListPage;
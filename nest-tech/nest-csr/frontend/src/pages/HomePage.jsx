import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <div className="home-header">
        <h1>欢迎使用 Nest CSR 应用</h1>
        <p>这是一个使用 React 和 NestJS 构建的客户端渲染应用</p>
      </div>
      
      <div className="home-content">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>用户管理</h3>
            <p>查看、添加、编辑和删除用户信息，支持批量操作</p>
            <Link to="/users" className="feature-link">
              前往用户管理
            </Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>现代技术栈</h3>
            <p>基于 React、NestJS、Zustand 和 React Router 构建</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>响应式设计</h3>
            <p>适配各种设备屏幕，提供良好的用户体验</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
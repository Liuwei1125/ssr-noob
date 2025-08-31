import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './AppLayout.css';

function AppLayout() {
  return (
    <div className="app-layout">
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/">Nest CSR 应用</Link>
          </div>
          <div className="navbar-menu">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/" className="nav-link">首页</Link>
              </li>
              <li className="nav-item">
                <Link to="/users" className="nav-link">用户管理</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="footer">
        <div className="footer-container">
          <p>&copy; {new Date().getFullYear()} Nest CSR 应用</p>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
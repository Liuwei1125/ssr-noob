import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">404</div>
        <h1>页面未找到</h1>
        <p>抱歉，您访问的页面不存在或已被移动</p>
        <Link to="/" className="back-home-btn">
          返回首页
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
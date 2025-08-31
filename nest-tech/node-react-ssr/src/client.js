const React = require('react');
const { hydrateRoot } = require('react-dom/client');
const App = require('./App.js');

// 从window对象中获取服务器传递的数据
const initialData = window.__INITIAL_DATA__ || [];

// 使用React 19的hydrateRoot API进行水合
const container = document.getElementById('app');
hydrateRoot(container, <App initialData={initialData} />);
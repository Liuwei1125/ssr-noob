import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../shared/components/App.js';


const app = express();
const PORT = process.env.PORT || 3000;


app.get('*', (req, res) => {
    // 将React组件渲染为HTML字符串
    const markup = renderToString(<App />);
    // 发送完整的HTML页面
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>React SSR示例</title>
        <meta charset="utf-8">
      </head>
      <body>
        <div id="root">${markup}</div>
      </body>
    </html>
  `;
  console.log(html);
    res.send(html);
});


app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

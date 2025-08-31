const http = require('http');
const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const App = require('./src/App.js');

// 示例数据，在实际应用中可能来自数据库
const initialData = ['服务端渲染的项目 1', '服务端渲染的项目 2', '服务端渲染的项目 3'];

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 处理静态文件请求
  if (req.url === '/bundle.js') {
    const filePath = path.join(__dirname, 'public', 'bundle.js');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
    return;
  }

  // 处理其他请求，进行服务器端渲染
  try {
    // 使用ReactDOMServer.renderToString渲染React组件为HTML字符串
    const appHtml = ReactDOMServer.renderToString(
      React.createElement(App, { initialData })
    );

    // 创建完整的HTML文档，包括服务器渲染的内容和客户端脚本
    const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React 19 SSR 示例</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
        </style>
      </head>
      <body>
        <!-- 服务器渲染的React内容将被插入到这里 -->
        <div id="app">${appHtml}</div>
        
        <!-- 将初始数据嵌入到页面中，供客户端水合使用 -->
        <script>
          window.__INITIAL_DATA__ = ${JSON.stringify(initialData)};
        </script>
        
        <!-- 客户端JavaScript，负责水合过程 -->
        <script src="/bundle.js"></script>
      </body>
      </html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } catch (error) {
    console.error('SSR错误:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('服务器错误');
  }
});

// 启动服务器
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('实现了React 19的服务端渲染和水合功能');
  console.log('访问页面查看服务端渲染效果，水合后将变为可交互状态');
});
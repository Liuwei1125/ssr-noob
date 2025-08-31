// 服务端渲染脚本 - 使用Node.js实现SSR
const http = require('http');
const fs = require('fs');
const path = require('path');

// 模拟ES模块导入
function requireESModule(modulePath) {
  const moduleContent = fs.readFileSync(modulePath, 'utf8');
  
  // 简单的模块导出处理
  const moduleExports = {};
  const exports = moduleExports;
  
  // 模拟h函数
  function h(type, props, ...children) {
    props = props || {};
    return {
      type,
      props: {
        ...props,
        children: children.length === 1 && (typeof children[0] === 'string' || typeof children[0] === 'number')
          ? children[0]
          : children
      }
    };
  }
  
  // 模拟Component类
  class Component {
    constructor(props) {
      this.props = props || {};
      this.state = {};
    }
  }
  
  // 执行模块代码
  const moduleCode = `
    (function(exports, h, Component) {
      ${moduleContent.replace(/import.*from.*['"].*['"]/g, '')}
    })(exports, h, Component);
  `;
  
  eval(moduleCode);
  return moduleExports;
}

// 渲染虚拟DOM为HTML字符串的函数
function renderToString(vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return String(vnode);
  }
  
  if (!vnode) {
    return '';
  }
  
  // 特殊处理：如果vnode有html属性，直接返回html字符串
  if (vnode.html) {
    return vnode.html;
  }
  
  const { type, props = {} } = vnode;
  
  // 如果type是函数，递归调用它
  if (typeof type === 'function') {
    const component = new type(props);
    const componentVnode = component.render ? component.render() : null;
    return renderToString(componentVnode);
  }
  
  // 构建属性字符串
  const attrs = Object.entries(props)
    .filter(([key]) => key !== 'children' && !key.startsWith('on'))
    .map(([key, value]) => {
      if (key === 'className') {
        return `class="${value}"`;
      }
      if (typeof value === 'boolean') {
        return value ? key : '';
      }
      return `${key}="${value}"`;
    })
    .filter(Boolean)
    .join(' ');
  
  // 处理事件属性
  const eventAttrs = Object.entries(props)
    .filter(([key]) => key.startsWith('on'))
    .map(([key, value]) => {
      const eventName = key.slice(2).toLowerCase();
      const handlerName = typeof value === 'function' ? value.name : value;
      return `data-event-${eventName}="${handlerName}"`;
    })
    .join(' ');
  
  const allAttrs = [attrs, eventAttrs].filter(Boolean).join(' ');
  const attrsString = allAttrs ? ` ${allAttrs}` : '';
  
  // 处理子节点
  const children = Array.isArray(props.children) ? props.children : [props.children];
  const childrenHTML = children.map(child => renderToString(child)).join('');
  
  return `<${type}${attrsString}>${childrenHTML}</${type}>`;
}

// 创建App组件的函数
function createAppComponent(props) {
  const { initialCount = 0, message = '欢迎使用SSR水合演示', serverRenderTime } = props;
  
  // 返回一个带有html属性的对象
  const html = `
    <div id="app" class="app-container">
      <header class="app-header">
        <h1>SSR + 客户端水合演示</h1>
        <p>页面渲染时间: ${serverRenderTime}</p>
      </header>
      <main class="app-main">
        <div class="status-info">
          <p>渲染模式: 服务端</p>
          <p>水合状态: 待水合</p>
        </div>
        <div class="counter-section">
          <h2>计数器演示</h2>
          <p class="counter-value">当前计数: ${initialCount}</p>
          <div class="button-group">
            <button class="btn btn-primary" data-event-click="handleClick">增加计数</button>
            <button class="btn btn-secondary" data-event-click="handleReset">重置计数</button>
          </div>
        </div>
        <div class="message-section">
          <h2>消息展示</h2>
          <p class="message-text">${message}</p>
          <button class="btn btn-info" data-event-click="handleToggleMessage">切换消息</button>
        </div>
      </main>
      <footer class="app-footer">
        <p>© 2023 SSR水合演示</p>
      </footer>
    </div>
  `;
  
  return { html };
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 处理根路径请求
  if (req.url === '/') {
    // 准备页面数据
    const pageProps = {
      initialCount: 0,
      message: '欢迎使用SSR水合演示',
      serverRenderTime: new Date().toLocaleString('zh-CN')
    };
    
    try {
      // 获取App组件的虚拟DOM
      const appVnode = createAppComponent(pageProps);
      
      // 渲染虚拟DOM为HTML字符串
      const appHtml = renderToString(appVnode);
      
      // 读取HTML模板
      const templatePath = path.join(__dirname, 'index.html');
      let template = fs.readFileSync(templatePath, 'utf8');
      
      // 调试信息
      console.log('渲染的App HTML长度:', appHtml.length);
      console.log('模板中是否包含APP_CONTENT:', template.includes('APP_CONTENT'));
      console.log('模板中是否包含APP_PROPS:', template.includes('APP_PROPS'));
      
      // 将App组件的HTML和props注入到模板中
      const beforeLength = template.length;
      
      // 更健壮的替换逻辑
      // 替换APP_CONTENT（HTML注释）
      const appContentRegex = /<!--\s*APP_CONTENT\s*-->/;
      if (appContentRegex.test(template)) {
        console.log('找到并替换APP_CONTENT');
        template = template.replace(appContentRegex, appHtml);
      } else {
        console.error('未找到APP_CONTENT占位符');
      }
      
      // 替换APP_PROPS（JavaScript注释）
      const appPropsRegex = /\/\/\s*APP_PROPS\s*/;
      if (appPropsRegex.test(template)) {
        console.log('找到并替换APP_PROPS');
        template = template.replace(appPropsRegex, `window.__APP_PROPS__ = ${JSON.stringify(pageProps)};`);
      } else {
        console.error('未找到APP_PROPS占位符');
      }
      
      console.log('替换后的模板长度变化:', template.length - beforeLength);
      
      // 设置响应头
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      
      // 发送响应
      res.end(template);
    } catch (error) {
      console.error('渲染错误:', error);
      res.writeHead(500, {
        'Content-Type': 'text/plain; charset=utf-8'
      });
      res.end('服务器渲染错误');
    }
  }
  // 处理静态文件请求
  else if (req.url.endsWith('.js')) {
    const filePath = path.join(__dirname, req.url);
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('文件未找到');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      res.end(data);
    });
  }
  // 处理其他请求
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('页面未找到');
  }
});

// 启动服务器
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('请在浏览器中访问该地址查看SSR水合演示');
  console.log('按 Ctrl+C 停止服务器');
});

// 优雅关闭服务器
process.on('SIGINT', () => {
  console.log('服务器正在关闭...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});
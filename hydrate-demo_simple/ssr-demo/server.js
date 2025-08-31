// 服务器端组件树生成和脱水演示
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. 组件树定义 - 服务器端
function createComponentTree() {
    // 模拟组件树结构
    return {
        type: 'div',
        props: {
            id: 'app',
            className: 'container',
            onClick: 'handleAppClick'
        },
        children: [
            '服务器渲染的内容',
            {
                type: 'h1',
                props: {
                    className: 'title'
                },
                children: 'SSR + 水合演示'
            },
            {
                type: 'button',
                props: {
                    id: 'clickButton',
                    onClick: 'handleButtonClick'
                },
                children: '点击我'
            },
            {
                type: 'div',
                props: {
                    className: 'counter'
                },
                children: [
                    '计数器: ',
                    {
                        type: 'span',
                        props: {
                            id: 'count'
                        },
                        children: '0'
                    }
                ]
            },
            {
                type: 'ul',
                props: {
                    className: 'list'
                },
                children: [
                    {
                        type: 'li',
                        props: {
                            onClick: 'handleItemClick'
                        },
                        children: '列表项 1'
                    },
                    {
                        type: 'li',
                        props: {
                            onClick: 'handleItemClick'
                        },
                        children: '列表项 2'
                    },
                    {
                        type: 'li',
                        props: {
                            onClick: 'handleItemClick'
                        },
                        children: '列表项 3'
                    }
                ]
            }
        ]
    };
}

// 2. 渲染器 - 将组件树转换为HTML字符串
function renderToHTML(vnode) {
    // 处理文本节点
    if (typeof vnode === 'string') {
        return vnode;
    }

    const { type, props = {}, children = [] } = vnode;
    
    // 构建属性字符串
    const attrs = Object.entries(props)
        .filter(([key]) => key !== 'children' && !key.startsWith('on'))
        .map(([key, value]) => ` ${key === 'className' ? 'class' : key}="${value}"`)
        .join('');

    // 递归渲染子节点
    const childrenHTML = Array.isArray(children) 
        ? children.map(child => renderToHTML(child)).join('') 
        : renderToHTML(children);

    return `<${type}${attrs}>${childrenHTML}</${type}>`;
}

// 3. 脱水函数 - 提取需要在客户端恢复的状态和事件
function dehydrate(vnode) {
    // 处理文本节点
    if (typeof vnode === 'string') {
        return null;
    }

    const { type, props = {}, children = [] } = vnode;
    const dehydratedData = {
        type,
        props: {},
        hasChildren: Array.isArray(children) ? children.length > 0 : typeof children === 'object'
    };
    
    // 提取事件处理器信息
    const eventHandlers = {};
    Object.entries(props)
        .filter(([key]) => key.startsWith('on'))
        .forEach(([key, value]) => {
            eventHandlers[key] = value;
        });
    
    if (Object.keys(eventHandlers).length > 0) {
        dehydratedData.events = eventHandlers;
    }
    
    // 提取需要在客户端使用的属性
    if (props.id) {
        dehydratedData.id = props.id;
    }
    
    // 递归处理子节点
    const childData = {};
    const processChild = (child, index) => {
        if (typeof child === 'object' && child) {
            const childId = child.props?.id || `child-${index}`;
            const childDehydrated = dehydrate(child);
            if (childDehydrated) {
                childData[childId] = childDehydrated;
            }
        }
    };
    
    if (Array.isArray(children)) {
        children.forEach(processChild);
    } else if (typeof children === 'object' && children) {
        processChild(children, 0);
    }
    
    if (Object.keys(childData).length > 0) {
        dehydratedData.children = childData;
    }
    
    return dehydratedData;
}

// 4. 创建HTTP服务器
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        // 生成组件树
        const componentTree = createComponentTree();
        
        // 脱水处理
        const dehydratedData = dehydrate(componentTree);
        
        // 渲染HTML
        const appHTML = renderToHTML(componentTree);
        
        // 创建基础HTML内容
        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSR + 水合演示</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
        .container { border: 1px solid #ddd; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto; }
        .title { color: #333; }
        button { padding: 8px 16px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0051cc; }
        .counter { margin: 15px 0; font-size: 18px; }
        .list { padding-left: 20px; }
        .list li { cursor: pointer; margin: 5px 0; }
        .list li:hover { color: #0070f3; }
    </style>
</head>
<body>
    <!-- 服务器渲染的内容 -->
    <div id="root">${appHTML}</div>
    
    <!-- 注入脱水数据 -->
    <script>window.__DEHYDRATED_DATA__ = ${JSON.stringify(dehydratedData)};</script>
    
    <!-- 客户端水合脚本 -->
    <script src="/client.js"></script>
</body>
</html>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (req.url === '/client.js') {
        // 提供客户端水合脚本
        fs.readFile(path.join(__dirname, 'client.js'), 'utf8', (err, script) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading client.js');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(script);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

// 启动服务器
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('演示流程:');
    console.log('1. 组件树生成 (服务器端)');
    console.log('2. 脱水处理 (提取交互信息)');
    console.log('3. 生成静态HTML并注入脱水数据');
    console.log('4. 传输到客户端');
    console.log('5. 客户端水合 (恢复交互性)');
    console.log('6. 用户可以与应用交互');
});
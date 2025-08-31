// 服务器端组件树生成和脱水演示
const http = require('http');
const fs = require('fs');
const path = require('path');

// 模拟数据存储
const mockData = {
    users: [
        { id: 1, name: '张三', age: 28 },
        { id: 2, name: '李四', age: 32 },
        { id: 3, name: '王五', age: 25 }
    ],
    products: [
        { id: 'p1', title: '产品A', price: 100 },
        { id: 'p2', title: '产品B', price: 200 },
        { id: 'p3', title: '产品C', price: 300 }
    ],
    // 模拟静态数据
    staticContent: {
        about: '关于我们的静态信息',
        contact: '联系我们的静态信息',
        lastUpdated: new Date().toISOString()
    }
};

// 模拟API调用延迟
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============== 仿照Next.js的数据获取函数 ==============

/**
 * getServerSideProps - 服务器端渲染数据获取函数
 * 在每次请求时运行，适用于需要动态数据的页面
 */
async function getServerSideProps(context) {
    console.log('[getServerSideProps] 正在获取动态数据...');
    
    // 模拟API调用
    await delay(300);
    
    // 根据请求路径返回不同的数据
    const { req } = context;
    let props = {};
    
    if (req.url === '/' || req.url === '/ssr') {
        // 首页数据
        props = {
            pageType: 'ssr',
            dataSource: 'server-side',
            currentTime: new Date().toLocaleString(),
            users: mockData.users,
            message: '此页面使用服务器端渲染，每次请求都会重新获取数据'
        };
    } else if (req.url.startsWith('/user/')) {
        // 用户详情页数据
        const userId = parseInt(req.url.split('/')[2]);
        const user = mockData.users.find(u => u.id === userId);
        
        props = {
            pageType: 'user-detail',
            dataSource: 'server-side',
            user: user || { id: userId, name: '用户不存在', age: 0 },
            currentTime: new Date().toLocaleString()
        };
    }
    
    console.log('[getServerSideProps] 数据获取完成:', props);
    
    return {
        props,
        // 可以添加notFound或redirect等属性
    };
}

/**
 * getStaticProps - 静态生成数据获取函数
 * 在构建时运行一次，适用于数据不频繁变化的页面
 * 在这个简化实现中，我们模拟构建时生成的数据
 */
async function getStaticProps() {
    console.log('[getStaticProps] 正在获取静态数据...');
    
    // 模拟构建时的数据获取
    await delay(200);
    
    const props = {
        pageType: 'static',
        dataSource: 'static-build-time',
        staticContent: mockData.staticContent,
        products: mockData.products,
        buildTime: new Date().toISOString(),
        message: '此页面使用静态生成，数据在构建时生成'
    };
    
    console.log('[getStaticProps] 静态数据获取完成:', props);
    
    return {
        props,
        // 在实际实现中，可以添加revalidate属性设置增量静态再生的时间（秒）
        // revalidate: 10,
    };
}

/**
 * 模拟的页面组件 - 接收props并生成组件树
 */
function PageComponent(props = {}) {
    const { 
        pageType = 'ssr',
        dataSource = 'unknown',
        currentTime = 'N/A',
        users = [],
        products = [],
        user = null,
        staticContent = {},
        buildTime = 'N/A',
        message = ''
    } = props;
    
    // 根据页面类型生成不同的组件树
    if (pageType === 'user-detail' && user) {
        // 用户详情页
        return {
            type: 'div',
            props: {
                id: 'app',
                className: 'container',
                onClick: 'handleAppClick'
            },
            children: [
                `服务器渲染的用户详情页 (${dataSource})`,
                { type: 'br' },
                { type: 'br' },
                {
                    type: 'h1',
                    props: { className: 'title' },
                    children: `用户详情 - ${user.name}`
                },
                {
                    type: 'div',
                    props: { className: 'user-info' },
                    children: [
                        `ID: ${user.id}`,
                        { type: 'br' },
                        `姓名: ${user.name}`,
                        { type: 'br' },
                        `年龄: ${user.age}`
                    ]
                },
                {
                    type: 'div',
                    props: { className: 'timestamp' },
                    children: `当前时间: ${currentTime}`
                },
                {
                    type: 'button',
                    props: {
                        id: 'backButton',
                        onClick: 'handleBackClick'
                    },
                    children: '返回首页'
                }
            ]
        };
    } else if (pageType === 'static') {
        // 静态生成页
        return {
            type: 'div',
            props: {
                id: 'app',
                className: 'container',
                onClick: 'handleAppClick'
            },
            children: [
                `静态生成页面 (${dataSource})`,
                { type: 'br' },
                { type: 'br' },
                {
                    type: 'h1',
                    props: { className: 'title' },
                    children: '静态内容展示'
                },
                {
                    type: 'div',
                    props: { className: 'static-content' },
                    children: [
                        `关于我们: ${staticContent.about || '暂无'}`,
                        { type: 'br' },
                        `联系我们: ${staticContent.contact || '暂无'}`
                    ]
                },
                {
                    type: 'div',
                    props: { className: 'build-info' },
                    children: `构建时间: ${buildTime}`
                },
                {
                    type: 'h2',
                    props: { className: 'subtitle' },
                    children: '产品列表'
                },
                {
                    type: 'ul',
                    props: { className: 'product-list' },
                    children: products.map((product, index) => ({
                        type: 'li',
                        props: {
                            onClick: 'handleProductClick',
                            'data-id': product.id
                        },
                        children: `${product.title} - ¥${product.price}`
                    }))
                },
                {
                    type: 'button',
                    props: {
                        id: 'refreshButton',
                        onClick: 'handleRefreshClick'
                    },
                    children: '刷新数据（仅客户端）'
                }
            ]
        };
    } else {
        // 首页/SSR页面
        return {
            type: 'div',
            props: {
                id: 'app',
                className: 'container',
                onClick: 'handleAppClick'
            },
            children: [
                `服务器渲染的内容 (${dataSource})`,
                { type: 'br' },
                { type: 'br' },
                {
                    type: 'h1',
                    props: { className: 'title' },
                    children: 'SSR + 水合演示'
                },
                {
                    type: 'div',
                    props: { className: 'message' },
                    children: message
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
                    type: 'h2',
                    props: { className: 'subtitle' },
                    children: '用户列表'
                },
                {
                    type: 'ul',
                    props: {
                        className: 'list'
                    },
                    children: users.map((user, index) => ({
                        type: 'li',
                        props: {
                            onClick: 'handleItemClick',
                            'data-id': user.id
                        },
                        children: `${user.name} (${user.age}岁)`
                    }))
                },
                {
                    type: 'div',
                    props: { className: 'timestamp' },
                    children: `当前时间: ${currentTime}`
                },
                {
                    type: 'div',
                    props: { className: 'nav' },
                    children: [
                        '其他页面: ',
                        {
                            type: 'a',
                            props: {
                                href: '/static',
                                onClick: 'handleNavClick'
                            },
                            children: '静态生成页'
                        }
                    ]
                }
            ]
        };
    }
}

// 2. 渲染器 - 将组件树转换为HTML字符串
function renderToHTML(vnode) {
    // 处理文本节点
    if (typeof vnode === 'string') {
        return vnode;
    }

    // 处理空标签
    if (vnode.type && !vnode.children) {
        return `<${vnode.type}${renderAttributes(vnode.props)} />`;
    }

    const { type, props = {}, children = [] } = vnode;
    
    // 构建属性字符串
    const attrs = renderAttributes(props);

    // 递归渲染子节点
    const childrenHTML = Array.isArray(children) 
        ? children.map(child => renderToHTML(child)).join('') 
        : renderToHTML(children);

    return `<${type}${attrs}>${childrenHTML}</${type}>`;
}

// 辅助函数：渲染属性
function renderAttributes(props) {
    if (!props) return '';
    
    return Object.entries(props)
        .filter(([key]) => key !== 'children' && !key.startsWith('on'))
        .map(([key, value]) => ` ${key === 'className' ? 'class' : key}="${value}"`)
        .join('');
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

// 模拟静态生成的数据缓存
let staticPropsCache = null;
let staticPageCache = null;

// 初始化时预先获取静态数据（模拟构建时行为）
async function initStaticData() {
    console.log('初始化静态数据...');
    const staticPropsResult = await getStaticProps();
    staticPropsCache = staticPropsResult.props;
    
    // 预渲染静态页面
    const staticComponentTree = PageComponent(staticPropsCache);
    staticPageCache = renderToHTML(staticComponentTree);
    console.log('静态数据初始化完成');
}

// 4. 创建HTTP服务器
const server = http.createServer(async (req, res) => {
    // 首页或SSR页面 - 使用getServerSideProps
    if (req.url === '/' || req.url === '/ssr' || req.url.startsWith('/user/')) {
        try {
            // 获取服务器端数据
            const propsResult = await getServerSideProps({ req, res });
            const props = propsResult.props || {};
            
            // 生成组件树（传入获取的数据）
            const componentTree = PageComponent(props);
            
            // 脱水处理
            const dehydratedData = dehydrate(componentTree);
            
            // 注入页面Props数据，供客户端使用
            const pageProps = {
                ...props,
                _nextPageProps: true
            };
            
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
        .container { border: 1px solid #ddd; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
        .title { color: #333; margin-top: 0; }
        .subtitle { color: #555; font-size: 18px; }
        button { padding: 8px 16px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 10px 0; }
        button:hover { background: #0051cc; }
        .counter { margin: 15px 0; font-size: 18px; }
        .list, .product-list { padding-left: 20px; }
        .list li, .product-list li { cursor: pointer; margin: 5px 0; padding: 5px; border-radius: 4px; }
        .list li:hover, .product-list li:hover { background-color: #f0f0f0; color: #0070f3; }
        .timestamp, .build-info { color: #888; font-size: 12px; margin-top: 20px; }
        .message { background-color: #f0f8ff; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .nav { margin-top: 20px; }
        .nav a { color: #0070f3; text-decoration: none; margin-left: 5px; }
        .nav a:hover { text-decoration: underline; }
        .user-info { background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .static-content { background-color: #f0fff0; padding: 15px; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <!-- 服务器渲染的内容 -->
    <div id="root">${appHTML}</div>
    
    <!-- 注入脱水数据 -->
    <script>window.__DEHYDRATED_DATA__ = ${JSON.stringify(dehydratedData)};</script>
    
    <!-- 注入页面Props数据 -->
    <script>window.__PAGE_PROPS__ = ${JSON.stringify(pageProps)};</script>
    
    <!-- 客户端水合脚本 -->
    <script src="/client.js"></script>
</body>
</html>`;
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (error) {
            console.error('Error in SSR:', error);
            res.writeHead(500);
            res.end('Internal Server Error');
        }
    } 
    // 静态页面 - 使用缓存的静态数据
    else if (req.url === '/static') {
        try {
            // 如果静态数据未缓存，先初始化
            if (!staticPageCache) {
                await initStaticData();
            }
            
            // 生成HTML（使用缓存的静态页面内容）
            const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>静态生成页面 - SSR + 水合演示</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
        .container { border: 1px solid #ddd; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
        .title { color: #333; margin-top: 0; }
        .subtitle { color: #555; font-size: 18px; }
        button { padding: 8px 16px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 10px 0; }
        button:hover { background: #0051cc; }
        .counter { margin: 15px 0; font-size: 18px; }
        .list, .product-list { padding-left: 20px; }
        .list li, .product-list li { cursor: pointer; margin: 5px 0; padding: 5px; border-radius: 4px; }
        .list li:hover, .product-list li:hover { background-color: #f0f0f0; color: #0070f3; }
        .timestamp, .build-info { color: #888; font-size: 12px; margin-top: 20px; }
        .message { background-color: #f0f8ff; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .nav { margin-top: 20px; }
        .nav a { color: #0070f3; text-decoration: none; margin-left: 5px; }
        .nav a:hover { text-decoration: underline; }
        .user-info { background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .static-content { background-color: #f0fff0; padding: 15px; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <!-- 静态生成的内容 -->
    <div id="root">${staticPageCache}</div>
    
    <!-- 注入页面Props数据 -->
    <script>window.__PAGE_PROPS__ = ${JSON.stringify(staticPropsCache)};</script>
    
    <!-- 客户端水合脚本 -->
    <script src="/client.js"></script>
</body>
</html>`;
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (error) {
            console.error('Error in static page:', error);
            res.writeHead(500);
            res.end('Internal Server Error');
        }
    }
    // 客户端水合脚本
    else if (req.url === '/client.js') {
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

// 初始化并启动服务器
async function startServer() {
    try {
        // 初始化静态数据
        await initStaticData();
        
        // 启动服务器
        const PORT = 3002;
        server.listen(PORT, () => {
            console.log(`服务器运行在 http://localhost:${PORT}`);
            console.log('演示功能:');
            console.log('1. 首页 (SSR): http://localhost:3002/');
            console.log('2. 静态生成页: http://localhost:3002/static');
            console.log('3. 用户详情页: http://localhost:3002/user/1');
            console.log('4. 数据获取方式:');
            console.log('   - getServerSideProps: 动态数据，每次请求都重新获取');
            console.log('   - getStaticProps: 静态数据，只在初始化时获取一次');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

// 启动服务器
startServer();
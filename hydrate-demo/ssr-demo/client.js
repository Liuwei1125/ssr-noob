// 客户端水合脚本

// 1. 客户端虚拟DOM定义 - 根据页面类型动态生成
function createClientComponentTree() {
    // 获取服务器传递的页面props数据
    const pageProps = window.__PAGE_PROPS__ || {};
    const { pageType = 'ssr', users = [], products = [], user = null, staticContent = {} } = pageProps;
    
    console.log('客户端获取到的页面Props:', pageProps);
    
    // 根据页面类型生成不同的组件树
    if (pageType === 'user-detail' && user) {
        // 用户详情页组件树
        return {
            type: 'div',
            props: {
                id: 'app',
                className: 'container',
                onClick: handleAppClick
            },
            children: [
                `服务器渲染的用户详情页 (${pageProps.dataSource})`,
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
                    children: `当前时间: ${pageProps.currentTime || new Date().toLocaleString()}`
                },
                {
                    type: 'button',
                    props: {
                        id: 'backButton',
                        onClick: handleBackClick
                    },
                    children: '返回首页'
                }
            ]
        };
    } else if (pageType === 'static') {
        // 静态页面组件树
        return {
            type: 'div',
            props: {
                id: 'app',
                className: 'container',
                onClick: handleAppClick
            },
            children: [
                `静态生成页面 (${pageProps.dataSource})`,
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
                    children: `构建时间: ${pageProps.buildTime || new Date().toISOString()}`
                },
                {
                    type: 'h2',
                    props: { className: 'subtitle' },
                    children: '产品列表'
                },
                {
                    type: 'ul',
                    props: {
                        className: 'product-list'
                    },
                    children: products.map((product, index) => ({
                        type: 'li',
                        props: {
                            onClick: handleProductClick,
                            'data-id': product.id
                        },
                        children: `${product.title} - ¥${product.price}`
                    }))
                },
                {
                    type: 'button',
                    props: {
                        id: 'refreshButton',
                        onClick: handleRefreshClick
                    },
                    children: '刷新数据（仅客户端）'
                }
            ]
        };
    } else {
        // 首页/SSR页面组件树
        // 提供默认的mock数据，以防服务器未提供
        const defaultUsers = [
            { id: 1, name: '张三', age: 28 },
            { id: 2, name: '李四', age: 32 },
            { id: 3, name: '王五', age: 25 }
        ];
        const displayUsers = users.length > 0 ? users : defaultUsers;
        
        return {
            type: 'div',
            props: {
                id: 'app',
                className: 'container',
                onClick: handleAppClick
            },
            children: [
                `服务器渲染的内容 (${pageProps.dataSource})`,
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
                    children: pageProps.message || ''
                },
                {
                    type: 'button',
                    props: {
                        id: 'clickButton',
                        onClick: handleButtonClick
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
                    props: {
                        className: 'subtitle'
                    },
                    children: '用户列表'
                },
                {
                    type: 'ul',
                    props: {
                        className: 'list'
                    },
                    children: displayUsers.map((user, index) => ({
                        type: 'li',
                        props: {
                            onClick: handleItemClick,
                            'data-id': user.id
                        },
                        children: `${user.name} (${user.age}岁)`
                    }))
                },
                {
                    type: 'div',
                    props: {
                        className: 'timestamp'
                    },
                    children: `当前时间: ${pageProps.currentTime || new Date().toLocaleString()}`
                },
                {
                    type: 'div',
                    props: {
                        className: 'nav'
                    },
                    children: [
                        '其他页面: ',
                        {
                            type: 'a',
                            props: {
                                href: '/static',
                                onClick: handleNavClick
                            },
                            children: '静态生成页'
                        }
                    ]
                }
            ]
        };
    }
}

// 2. 客户端事件处理函数
function handleAppClick() {
    console.log('容器点击事件触发! (水合成功)');
    alert('容器点击事件触发! (水合成功)');
    
    // 更新计数器示例 - 展示水合后应用的交互性
    const countEl = document.getElementById('count');
    if (countEl) {
        const currentCount = parseInt(countEl.textContent);
        countEl.textContent = currentCount + 1;
    }
}

function handleButtonClick() {
    console.log('按钮点击事件触发! (水合成功)');
    alert('按钮点击事件触发! (水合成功)');
}

function handleItemClick(e) {
    const userId = e.target.getAttribute('data-id');
    console.log(`用户点击事件触发! (用户ID: ${userId})`);
    alert(`点击了用户: ${e.target.textContent}`);
}

// 新增：产品点击处理
function handleProductClick(e) {
    const productId = e.target.getAttribute('data-id');
    console.log(`产品点击事件触发! (产品ID: ${productId})`);
    alert(`点击了产品: ${e.target.textContent}`);
}

// 新增：返回首页按钮处理
function handleBackClick() {
    console.log('返回首页按钮点击');
    window.location.href = '/';
}

// 新增：导航链接处理
function handleNavClick(e) {
    console.log('导航链接点击:', e.target.getAttribute('href'));
    // 允许默认行为继续（页面跳转）
}

// 新增：刷新数据按钮处理
function handleRefreshClick() {
    console.log('刷新数据按钮点击 (仅客户端)');
    // 模拟客户端数据刷新
    const buildTimeEl = document.querySelector('.build-info');
    if (buildTimeEl) {
        buildTimeEl.textContent = `客户端刷新时间: ${new Date().toLocaleString()}`;
    }
    alert('已在客户端刷新数据显示!\n注意: 静态页面数据在服务器端缓存，客户端刷新仅更新显示，不重新获取数据。');
}

// 3. 增强版hydrateRoot实现 - 支持动态组件树
function hydrateRoot(container, vnode) {
    if (!(container instanceof HTMLElement)) {
        throw new Error('Target container is not a DOM element');
    }

    const root = {
        container,
        vnode,
        isHydrated: false,
        pageProps: window.__PAGE_PROPS__ || {}
    };

    // 递归水合函数
    function hydrate(element, vnode, dehydratedData = {}) {
        // 处理文本节点
        if (typeof vnode === 'string') {
            if (element.textContent !== vnode) {
                console.warn('文本内容不匹配:', element.textContent, 'vs', vnode);
            }
            return;
        }

        // 验证元素类型
        if (element.tagName && vnode.type && element.tagName.toLowerCase() !== vnode.type) {
            throw new Error(`元素类型不匹配: 期望 ${vnode.type}, 实际 ${element.tagName}`);
        }

        // 绑定属性和事件
        if (vnode.props) {
            Object.keys(vnode.props).forEach(key => {
                if (key.startsWith('on')) {
                    // 绑定事件处理器
                    const eventName = key.toLowerCase().slice(2);
                    const handler = vnode.props[key];
                    
                    // 检查是否已经绑定了事件处理器
                    const hasExistingListener = Array.from(element.listeners || []).some(l => l.type === eventName);
                    if (!hasExistingListener) {
                        element.addEventListener(eventName, handler);
                        console.log(`绑定事件: ${eventName} 到 ${element.tagName}#${element.id || ''}`);
                    }
                } else if (key !== 'children') {
                    // 同步属性
                    const attrName = key === 'className' ? 'class' : key;
                    if (element.getAttribute(attrName) !== vnode.props[key]) {
                        element.setAttribute(attrName, vnode.props[key]);
                    }
                }
            });
        }

        // 处理子节点
        const childNodes = Array.from(element.childNodes)
            .filter(node => node.nodeType === 1 || node.nodeType === 3);
        const children = Array.isArray(vnode.children) ? vnode.children : [vnode.children];

        // 确保只处理有效的子节点
        const validChildren = children.filter(child => child !== null && child !== undefined);

        validChildren.forEach((childVNode, index) => {
            if (index < childNodes.length) {
                // 获取当前子节点的脱水数据
                const childDehydratedData = dehydratedData.children?.[`child-${index}`] || 
                                           dehydratedData.children?.[childVNode.props?.id] || {};
                hydrate(childNodes[index], childVNode, childDehydratedData);
            } else {
                console.warn('子节点数量不匹配，客户端补充渲染');
                // 在实际应用中，这里会进行客户端渲染补充缺失的节点
            }
        });
    }

    // 获取脱水数据
    const dehydratedData = window.__DEHYDRATED_DATA__ || {};
    console.log('接收到的脱水数据:', dehydratedData);

    // 启动水合
    console.log('开始水合过程...');
    console.log('页面类型:', root.pageProps.pageType || 'ssr');
    
    // 获取实际的根组件元素
    const rootElement = container.firstElementChild;
    if (rootElement) {
        hydrate(rootElement, vnode, dehydratedData);
        root.isHydrated = true;
    }

    return {
        ...root,
        render(newVNode) {
            root.vnode = newVNode;
            hydrate(container.firstElementChild, newVNode, dehydratedData);
        }
    };
}

// 4. 执行水合
function startHydration() {
    console.log('页面加载完成，准备开始水合...');
    
    // 检查DOM是否已加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

function init() {
    const container = document.getElementById('root');
    if (!container) {
        console.error('未找到根容器元素');
        return;
    }
    
    // 创建客户端组件树（根据页面类型动态生成）
    const clientComponentTree = createClientComponentTree();
    
    // 执行水合
    const root = hydrateRoot(container, clientComponentTree);
    console.log('水合完成:', root);
    
    // 添加日志，表明应用已完全可交互
    console.log('应用已完全可交互! 尝试点击页面上的元素。');
    
    // 在控制台中显示水合过程的摘要
    const summary = document.createElement('div');
    summary.style.position = 'fixed';
    summary.style.bottom = '10px';
    summary.style.right = '10px';
    summary.style.background = 'rgba(0,0,0,0.8)';
    summary.style.color = 'white';
    summary.style.padding = '10px';
    summary.style.borderRadius = '4px';
    summary.style.fontSize = '12px';
    
    // 根据页面类型显示不同的水合信息
    const pageProps = window.__PAGE_PROPS__ || {};
    let summaryText = '水合完成! 查看控制台了解更多详情。';
    
    if (pageProps.pageType === 'ssr') {
        summaryText = 'SSR页面水合完成! 数据每次请求都从服务器获取。';
    } else if (pageProps.pageType === 'static') {
        summaryText = '静态页面水合完成! 数据在服务器端构建时生成。';
    } else if (pageProps.pageType === 'user-detail') {
        summaryText = '用户详情页水合完成! 数据从服务器动态获取。';
    }
    
    summary.textContent = summaryText;
    document.body.appendChild(summary);
    
    // 3秒后移除摘要提示
    setTimeout(() => {
        summary.remove();
    }, 3000);
}

// 启动水合过程
startHydration();

// 5. 调试辅助函数 - 增强版
window.__debug = {
    // 提供一个方法让用户可以手动触发重新水合（用于演示）
    rehydrate: function() {
        console.log('手动触发重新水合...');
        init();
    },
    
    // 显示当前脱水数据
    showDehydratedData: function() {
        console.log('当前脱水数据:', window.__DEHYDRATED_DATA__);
        return window.__DEHYDRATED_DATA__;
    },
    
    // 显示页面Props数据
    showPageProps: function() {
        console.log('当前页面Props:', window.__PAGE_PROPS__);
        return window.__PAGE_PROPS__;
    },
    
    // 显示水合状态
    showHydrationStatus: function() {
        const container = document.getElementById('root');
        const hasEventListeners = container && container.onclick !== null;
        
        const result = {
            isHydrated: hasEventListeners,
            pageType: window.__PAGE_PROPS__?.pageType || 'unknown',
            dataSource: window.__PAGE_PROPS__?.dataSource || 'unknown',
            hasDehydratedData: !!window.__DEHYDRATED_DATA__,
            hasPageProps: !!window.__PAGE_PROPS__,
            timestamp: new Date().toISOString()
        };
        
        console.log('水合状态:', result);
        return result;
    },
    
    // 刷新页面数据（仅客户端）
    refreshClientData: function() {
        console.log('刷新客户端数据...');
        // 模拟客户端数据更新
        const timestampEl = document.querySelector('.timestamp');
        if (timestampEl) {
            timestampEl.textContent = `当前时间: ${new Date().toLocaleString()}`;
        }
        return '客户端数据已刷新';
    }
};
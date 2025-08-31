// 客户端水合脚本

// 1. 客户端虚拟DOM定义 - 与服务器端保持一致的结构
function createClientComponentTree() {
    return {
        type: 'div',
        props: {
            id: 'app',
            className: 'container',
            onClick: handleAppClick
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
                type: 'ul',
                props: {
                    className: 'list'
                },
                children: [
                    {
                        type: 'li',
                        props: {
                            onClick: handleItemClick
                        },
                        children: '列表项 1'
                    },
                    {
                        type: 'li',
                        props: {
                            onClick: handleItemClick
                        },
                        children: '列表项 2'
                    },
                    {
                        type: 'li',
                        props: {
                            onClick: handleItemClick
                        },
                        children: '列表项 3'
                    }
                ]
            }
        ]
    };
}

// 2. 客户端事件处理函数
function handleAppClick() {
    console.log('容器点击事件触发! (水合成功)');
    alert('容器点击事件触发! (水合成功)');
    
    // 更新计数器示例 - 展示水合后应用的交互性
    const countEl = document.getElementById('count');
    const currentCount = parseInt(countEl.textContent);
    countEl.textContent = currentCount + 1;
}

function handleButtonClick() {
    console.log('按钮点击事件触发! (水合成功)');
    alert('按钮点击事件触发! (水合成功)');
}

function handleItemClick(e) {
    console.log('列表项点击事件触发! (水合成功)');
    alert(`点击了: ${e.target.textContent}`);
}

// 3. 简化版hydrateRoot实现
function hydrateRoot(container, vnode) {
    if (!(container instanceof HTMLElement)) {
        throw new Error('Target container is not a DOM element');
    }

    const root = {
        container,
        vnode,
        isHydrated: false
    };

    // 递归水合函数
    function hydrate(element, vnode, dehydratedData = {}) {
        console.log('正在水合元素:', element.tagName || 'text', '匹配vnode类型:', vnode.type || 'text');
        
        // 处理文本节点
        if (typeof vnode === 'string') {
            if (element.textContent !== vnode) {
                console.warn('文本内容不匹配:', element.textContent, 'vs', vnode);
            }
            return;
        }

        // 验证元素类型
        if (element.tagName.toLowerCase() !== vnode.type) {
            throw new Error(`元素类型不匹配: 期望 ${vnode.type}, 实际 ${element.tagName}`);
        }

        // 绑定属性和事件
        Object.keys(vnode.props || {}).forEach(key => {
            if (key.startsWith('on')) {
                const eventName = key.toLowerCase().slice(2);
                const handler = vnode.props[key];
                element.addEventListener(eventName, handler);
                console.log(`绑定事件: ${eventName}`);
            } else if (key !== 'children') {
                // 只在属性不匹配时设置
                const attrName = key === 'className' ? 'class' : key;
                if (element.getAttribute(attrName) !== vnode.props[key]) {
                    element.setAttribute(attrName, vnode.props[key]);
                }
            }
        });

        // 处理子节点
        const childNodes = Array.from(element.childNodes)
            .filter(node => node.nodeType === 1 || node.nodeType === 3);
        const children = Array.isArray(vnode.children) ? vnode.children : [vnode.children];

        // 确保只处理有效的子节点
        const validChildren = children.filter(child => child !== null && child !== undefined);

        validChildren.forEach((childVNode, index) => {
            if (index < childNodes.length) {
                // 获取当前子节点的脱水数据
                const childDehydratedData = dehydratedData.children?.[`child-${index}`] || {};
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
    hydrate(container.firstElementChild, vnode, dehydratedData);
    root.isHydrated = true;

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
    
    // 创建客户端组件树
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
    summary.textContent = '水合完成! 查看控制台了解更多详情。';
    document.body.appendChild(summary);
    
    // 3秒后移除摘要提示
    setTimeout(() => {
        summary.remove();
    }, 3000);
}

// 启动水合过程
startHydration();

// 5. 调试辅助函数
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
    
    // 显示水合状态
    showHydrationStatus: function() {
        const container = document.getElementById('root');
        const hasEventListeners = container && container.onclick !== null;
        const button = document.getElementById('clickButton');
        const buttonHasListener = button && Array.from(button.eventListeners || []).length > 0;
        
        return {
            isHydrated: hasEventListeners || buttonHasListener,
            containerHasEvents: hasEventListeners,
            buttonHasEvents: buttonHasListener,
            timestamp: new Date().toISOString()
        };
    }
};
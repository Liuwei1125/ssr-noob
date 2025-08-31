// 简化版hydrateRoot实现
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
    function hydrate(element, vnode) {
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
                element.setAttribute(key, vnode.props[key]);
            }
        });

        // 处理子节点
        const childNodes = Array.from(element.childNodes)
            .filter(node => node.nodeType === 1 || node.nodeType === 3);
        const children = Array.isArray(vnode.children) ? vnode.children : [vnode.children];

        children.forEach((childVNode, index) => {
            if (index < childNodes.length) {
                hydrate(childNodes[index], childVNode);
            } else {
                console.warn('子节点数量不匹配，客户端补充渲染');
            }
        });
    }

    // 启动水合
    hydrate(container.firstElementChild, vnode);
    root.isHydrated = true;

    return {
        ...root,
        render(newVNode) {
            root.vnode = newVNode;
            hydrate(container.firstElementChild, newVNode);
        }
    };
}

// 客户端虚拟DOM定义
const appVNode = {
    type: 'div',
    props: {
        className: 'app',
        onClick: () => {
            alert('容器点击事件触发! (水合成功)');
        }
    },
    children: [
        '服务器渲染的内容',
        {
            type: 'button',
            props: {
                onClick: () => {
                    alert('按钮点击事件触发! (水合成功)');
                }
            },
            children: '点击我'
        }
    ]
};

// 执行水合
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root');
    const root = hydrateRoot(container, appVNode);
    console.log('水合完成:', root);
});

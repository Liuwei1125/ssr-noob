// 虚拟DOM工具函数 - 同时适用于客户端和服务端

/**
 * 创建虚拟DOM节点的函数（React风格的h函数）
 * @param {string|function} type - 元素类型或组件函数
 * @param {object} props - 属性对象
 * @param {...*} children - 子节点
 * @returns {object} 虚拟DOM节点
 */
export function h(type, props, ...children) {
  // 确保props是对象
  props = props || {};
  
  return {
    type,
    props: {
      ...props,
      // 处理子节点，如果只有一个子节点且是字符串或数字，可以直接赋值
      children: children.length === 1 && (typeof children[0] === 'string' || typeof children[0] === 'number') 
        ? children[0] 
        : children
    }
  };
}

/**
 * 将虚拟DOM渲染为HTML字符串（服务端使用）
 * @param {object|string} vnode - 虚拟DOM节点
 * @returns {string} HTML字符串
 */
export function renderToString(vnode) {
  // 处理文本节点
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return String(vnode);
  }
  
  // 处理null或undefined
  if (!vnode) {
    return '';
  }
  
  const { type, props = {} } = vnode;
  
  // 如果type是函数，递归调用它获取虚拟DOM
  if (typeof type === 'function') {
    const component = new type(props);
    const componentVnode = component.render ? component.render() : null;
    return renderToString(componentVnode);
  }
  
  // 构建属性字符串
  const attrs = Object.entries(props)
    .filter(([key]) => key !== 'children' && !key.startsWith('on')) // 跳过children和事件处理函数
    .map(([key, value]) => {
      // 处理className特殊情况
      if (key === 'className') {
        return `class="${value}"`;
      }
      // 处理布尔值属性
      if (typeof value === 'boolean') {
        return value ? key : '';
      }
      return `${key}="${value}"`;
    })
    .filter(Boolean) // 过滤空字符串
    .join(' ');
  
  // 处理事件属性，将其作为data属性保存
  const eventAttrs = Object.entries(props)
    .filter(([key]) => key.startsWith('on'))
    .map(([key, value]) => {
      const eventName = key.slice(2).toLowerCase();
      // 在服务端，事件处理函数只是字符串标识符
      const handlerName = typeof value === 'function' ? value.name : value;
      return `data-event-${eventName}="${handlerName}"`;
    })
    .join(' ');
  
  const allAttrs = [attrs, eventAttrs].filter(Boolean).join(' ');
  const attrsString = allAttrs ? ` ${allAttrs}` : '';
  
  // 处理子节点
  const children = Array.isArray(props.children) ? props.children : [props.children];
  const childrenHTML = children.map(child => renderToString(child)).join('');
  
  // 返回完整的HTML字符串
  return `<${type}${attrsString}>${childrenHTML}</${type}>`;
}

/**
 * 客户端水合函数 - 将虚拟DOM与真实DOM绑定
 * @param {HTMLElement} container - 容器元素
 * @param {object} vnode - 虚拟DOM节点
 * @param {object} eventHandlers - 事件处理函数映射
 */
export function hydrate(container, vnode, eventHandlers = {}) {
  if (!container || !vnode) {
    return;
  }
  
  // 处理文本节点
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return;
  }
  
  const { type, props = {} } = vnode;
  
  // 如果type是函数，递归调用它获取虚拟DOM
  if (typeof type === 'function') {
    const component = new type(props);
    const componentVnode = component.render ? component.render() : null;
    hydrate(container, componentVnode, eventHandlers);
    return;
  }
  
  // 递归水合子节点
  if (props.children && container.firstChild) {
    const children = Array.isArray(props.children) ? props.children : [props.children];
    let domChild = container.firstChild;
    let vChildIndex = 0;
    
    while (domChild && vChildIndex < children.length) {
      // 跳过文本节点和注释节点
      if (domChild.nodeType === 3 || domChild.nodeType === 8) {
        domChild = domChild.nextSibling;
        continue;
      }
      
      hydrate(domChild, children[vChildIndex], eventHandlers);
      
      domChild = domChild.nextSibling;
      vChildIndex++;
    }
  }
  
  // 绑定事件处理函数
  Object.entries(props)
    .filter(([key]) => key.startsWith('on'))
    .forEach(([key, handler]) => {
      const eventName = key.slice(2).toLowerCase();
      
      // 如果handler是函数，直接绑定
      if (typeof handler === 'function') {
        container.addEventListener(eventName, handler);
      }
      // 如果handler是字符串，从eventHandlers中查找
      else if (typeof handler === 'string' && eventHandlers[handler]) {
        container.addEventListener(eventName, eventHandlers[handler]);
      }
    });
}

/**
 * 基础组件类（类似React.Component）
 */
export class Component {
  constructor(props) {
    this.props = props || {};
    this.state = {};
  }
  
  // 简单的setState实现
  setState(newState) {
    this.state = { ...this.state, ...newState };
    // 在客户端环境下重新渲染
    if (typeof window !== 'undefined' && this._rootNode) {
      const vnode = this.render();
      // 这里简化处理，实际实现需要diff算法
      this._rootNode.innerHTML = '';
      const newElement = createElement(vnode);
      this._rootNode.appendChild(newElement);
    }
  }
}

/**
 * 在客户端创建真实DOM元素（用于初始渲染或更新）
 * @param {object|string} vnode - 虚拟DOM节点
 * @returns {HTMLElement|Text} 真实DOM节点
 */
export function createElement(vnode) {
  // 处理文本节点
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode));
  }
  
  // 处理null或undefined
  if (!vnode) {
    return document.createTextNode('');
  }
  
  const { type, props = {} } = vnode;
  
  // 如果type是函数，递归调用它
  if (typeof type === 'function') {
    const component = new type(props);
    const componentVnode = component.render ? component.render() : null;
    return createElement(componentVnode);
  }
  
  // 创建元素
  const element = document.createElement(type);
  
  // 设置属性
  Object.entries(props)
    .filter(([key]) => key !== 'children' && !key.startsWith('on'))
    .forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    });
  
  // 设置事件处理函数
  Object.entries(props)
    .filter(([key]) => key.startsWith('on'))
    .forEach(([key, handler]) => {
      if (typeof handler === 'function') {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, handler);
      }
    });
  
  // 添加子节点
  if (props.children) {
    const children = Array.isArray(props.children) ? props.children : [props.children];
    children.forEach(child => {
      element.appendChild(createElement(child));
    });
  }
  
  return element;
}
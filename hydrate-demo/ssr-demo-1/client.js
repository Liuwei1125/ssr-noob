// 客户端水合脚本 - 使用ES模块
// 模拟ES模块导入
let App = null;
let createAppComponent = null;
let eventHandlers = null;

// 尝试从全局对象获取App组件定义
if (window.__APP_MODULE__ && window.__APP_MODULE__.App) {
  App = window.__APP_MODULE__.App;
}

// 等待DOM加载完成后执行水合
document.addEventListener('DOMContentLoaded', () => {
  console.log('客户端水合开始执行...');
  
  // 检查是否存在服务端传递的数据
  if (!window.__APP_PROPS__) {
    console.warn('未找到服务端传递的数据，使用默认值');
    window.__APP_PROPS__ = {
      initialCount: 0,
      message: '客户端渲染模式',
      serverRenderTime: '客户端渲染'
    };
  }
  
  // 记录水合开始时间
  const hydrateStartTime = performance.now();
  
  try {
    // 从服务端渲染的HTML中获取根元素
    const rootElement = document.getElementById('app');
    
    if (!rootElement) {
      console.error('未找到根元素 #app，无法进行水合');
      return;
    }
    
    // 水合前的准备工作
    console.log('准备水合的根元素:', rootElement);
    console.log('服务端传递的数据:', window.__APP_PROPS__);
    
    // 初始化水合状态指示器
    initHydrationIndicator();
    
    // 创建App组件实例
    let appInstance;
    if (App) {
      appInstance = new App(window.__APP_PROPS__);
    } else if (createAppComponent) {
      appInstance = createAppComponent(window.__APP_PROPS__);
    } else {
      console.warn('未找到App组件定义，使用模拟组件');
      // 模拟App组件实例
      appInstance = createMockAppInstance(window.__APP_PROPS__);
    }
    
    // 将App实例存储在全局，以便事件处理函数访问
    window.__APP_INSTANCE__ = appInstance;
    
    // 执行水合
    hydrate(rootElement, appInstance);
    
    // 标记水合完成
    markHydrationComplete(hydrateStartTime);
    
    // 如果组件有componentDidMount方法，调用它
    if (appInstance.componentDidMount && typeof appInstance.componentDidMount === 'function') {
      appInstance.componentDidMount();
    }
    
  } catch (error) {
    console.error('客户端水合失败:', error);
    // 如果水合失败，显示错误信息
    showHydrationError(error);
  }
});

/**
 * 水合函数 - 将交互功能绑定到服务端渲染的DOM上
 */
function hydrate(element, component) {
  console.log('开始水合元素:', element.tagName);
  
  // 递归处理所有子元素
  Array.from(element.children).forEach(child => hydrate(child, component));
  
  // 处理当前元素的事件
  const dataAttributes = element.dataset;
  
  // 检查所有以event-开头的数据属性
  Object.keys(dataAttributes).forEach(key => {
    if (key.startsWith('event')) {
      const eventName = key.replace('event', '').toLowerCase();
      const handlerName = dataAttributes[key];
      
      // 查找对应的处理函数
      const handler = findEventHandler(handlerName, component);
      
      if (handler) {
        console.log(`为元素 ${element.tagName}#${element.id || ''} 添加事件监听: ${eventName}`);
        
        // 添加事件监听器
        element.addEventListener(eventName, handler);
        
        // 移除数据属性，避免重复绑定
        delete element.dataset[key];
      } else {
        console.warn(`未找到事件处理函数: ${handlerName}`);
      }
    }
  });
  
  // 标记元素已水合
  element.setAttribute('data-hydrated', 'true');
}

/**
 * 查找事件处理函数
 */
function findEventHandler(handlerName, component) {
  // 首先在组件实例中查找
  if (component && typeof component[handlerName] === 'function') {
    return component[handlerName].bind(component);
  }
  
  // 然后在全局事件处理函数集合中查找
  if (window.__EVENT_HANDLERS__ && window.__EVENT_HANDLERS__[handlerName]) {
    return window.__EVENT_HANDLERS__[handlerName];
  }
  
  // 最后在全局作用域中查找
  if (window[handlerName] && typeof window[handlerName] === 'function') {
    return window[handlerName];
  }
  
  return null;
}

/**
 * 初始化水合状态指示器
 */
function initHydrationIndicator() {
  // 创建水合状态指示器
  let indicator = document.getElementById('hydration-indicator');
  
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'hydration-indicator';
    indicator.style.position = 'fixed';
    indicator.style.bottom = '10px';
    indicator.style.right = '10px';
    indicator.style.padding = '8px 12px';
    indicator.style.backgroundColor = '#333';
    indicator.style.color = '#fff';
    indicator.style.borderRadius = '4px';
    indicator.style.fontSize = '14px';
    indicator.style.zIndex = '9999';
    indicator.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    document.body.appendChild(indicator);
  }
  
  indicator.textContent = '水合中...';
  indicator.style.backgroundColor = '#666';
}

/**
 * 标记水合完成
 */
function markHydrationComplete(startTime) {
  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);
  
  console.log(`客户端水合完成！耗时: ${duration}ms`);
  
  // 更新水合状态指示器
  const indicator = document.getElementById('hydration-indicator');
  if (indicator) {
    indicator.textContent = `水合完成！耗时: ${duration}ms`;
    indicator.style.backgroundColor = '#4CAF50';
    
    // 3秒后自动隐藏
    setTimeout(() => {
      indicator.style.transition = 'opacity 0.3s ease';
      indicator.style.opacity = '0';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }, 3000);
  }
  
  // 显示水合完成的提示
  showHydrationCompleteNotification(duration);
}

/**
 * 显示水合完成的通知
 */
function showHydrationCompleteNotification(duration) {
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.padding = '12px 20px';
  notification.style.backgroundColor = '#4CAF50';
  notification.style.color = 'white';
  notification.style.borderRadius = '4px';
  notification.style.fontSize = '14px';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  notification.style.transition = 'opacity 0.5s ease';
  notification.textContent = `🎉 客户端水合成功！耗时: ${duration}ms`;
  
  document.body.appendChild(notification);
  
  // 3秒后淡出
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 3000);
}

/**
 * 显示水合错误信息
 */
function showHydrationError(error) {
  console.error('水合错误详情:', error);
  
  const errorElement = document.createElement('div');
  errorElement.style.position = 'fixed';
  errorElement.style.top = '20px';
  errorElement.style.left = '50%';
  errorElement.style.transform = 'translateX(-50%)';
  errorElement.style.padding = '12px 20px';
  errorElement.style.backgroundColor = '#f44336';
  errorElement.style.color = 'white';
  errorElement.style.borderRadius = '4px';
  errorElement.style.fontSize = '14px';
  errorElement.style.zIndex = '10000';
  errorElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  errorElement.textContent = '❌ 客户端水合失败，请查看控制台获取详情';
  
  document.body.appendChild(errorElement);
}

/**
 * 创建模拟的App组件实例（用于降级处理）
 */
function createMockAppInstance(props) {
  // 模拟状态
  let state = {
    count: props.initialCount || 0,
    message: props.message || '客户端渲染模式',
    isClient: true
  };
  
  // 模拟setState函数
  function setState(newState) {
    state = { ...state, ...newState };
    
    // 更新DOM
    if (document.querySelector('.counter-value')) {
      document.querySelector('.counter-value').textContent = `当前计数: ${state.count}`;
    }
    
    if (document.querySelector('.message-text')) {
      document.querySelector('.message-text').textContent = state.message;
    }
    
    if (document.querySelector('.status-info p:first-child')) {
      document.querySelector('.status-info p:first-child').textContent = `渲染模式: ${state.isClient ? '客户端' : '服务端'}`;
    }
  }
  
  return {
    props,
    state,
    setState,
    
    // 模拟事件处理函数
    handleClick: function() {
      setState({ count: state.count + 1 });
    },
    
    handleReset: function() {
      setState({ count: 0 });
    },
    
    handleToggleMessage: function() {
      setState({
        message: state.message === '欢迎使用SSR水合演示' 
          ? '水合成功！组件现在可以交互了' 
          : '欢迎使用SSR水合演示'
      });
    }
  };
}

// 导出客户端API（可选）
window.__CLIENT_API__ = {
  hydrate,
  findEventHandler
};
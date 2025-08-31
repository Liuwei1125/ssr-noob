// App组件定义 - 同时适用于客户端和服务端
import { h, Component } from './vdom.js';

/**
 * App组件 - 使用虚拟DOM的h函数形式定义
 */
export class App extends Component {
  constructor(props) {
    super(props);
    
    // 组件状态
    this.state = {
      count: props.initialCount || 0,
      message: props.message || '欢迎使用SSR水合演示',
      isClient: false
    };
    
    // 绑定事件处理函数
    this.handleClick = this.handleClick.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleToggleMessage = this.handleToggleMessage.bind(this);
  }
  
  // 点击计数器按钮的处理函数
  handleClick() {
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  }
  
  // 重置计数器的处理函数
  handleReset() {
    this.setState({
      count: 0
    });
  }
  
  // 切换消息的处理函数
  handleToggleMessage() {
    this.setState(prevState => ({
      message: prevState.message === '欢迎使用SSR水合演示' 
        ? '水合成功！组件现在可以交互了' 
        : '欢迎使用SSR水合演示'
    }));
  }
  
  // 组件挂载后（客户端）调用
  componentDidMount() {
    // 标记为客户端环境
    this.setState({ isClient: true });
    
    // 这里可以添加客户端特有的逻辑
    console.log('App组件已挂载到客户端');
  }
  
  // 渲染组件的虚拟DOM
  render() {
    const { count, message, isClient } = this.state;
    const { serverRenderTime } = this.props;
    
    return h('div', { 
      id: 'app', 
      className: 'app-container',
      onClick: this.handleAppClick // 容器点击事件
    },
      h('header', { className: 'app-header' },
        h('h1', null, 'SSR + 客户端水合演示'),
        h('p', null, `页面渲染时间: ${serverRenderTime}`)
      ),
      
      h('main', { className: 'app-main' },
        h('div', { className: 'status-info' },
          h('p', null, `渲染模式: ${isClient ? '客户端' : '服务端'}`),
          h('p', null, `水合状态: ${isClient ? '已水合' : '待水合'}`)
        ),
        
        h('div', { className: 'counter-section' },
          h('h2', null, '计数器演示'),
          h('p', { className: 'counter-value' }, `当前计数: ${count}`),
          h('div', { className: 'button-group' },
            h('button', { 
              className: 'btn btn-primary',
              onClick: this.handleClick
            }, '增加计数'),
            h('button', { 
              className: 'btn btn-secondary',
              onClick: this.handleReset
            }, '重置计数')
          )
        ),
        
        h('div', { className: 'message-section' },
          h('h2', null, '消息展示'),
          h('p', { className: 'message-text' }, message),
          h('button', { 
            className: 'btn btn-info',
            onClick: this.handleToggleMessage
          }, '切换消息')
        )
      ),
      
      h('footer', { className: 'app-footer' },
        h('p', null, '© 2023 SSR水合演示')
      )
    );
  }
  
  // 容器点击事件处理函数
  handleAppClick(event) {
    // 只有当点击的是容器本身而不是其子元素时才触发
    if (event.target.id === 'app') {
      console.log('App容器被点击了');
    }
  }
}

/**
 * 创建App组件的工厂函数，方便服务端使用
 */
export function createAppComponent(props) {
  return new App(props);
}

/**
 * 事件处理函数集合，用于服务端渲染时引用
 */
export const eventHandlers = {
  handleClick: function(event) {
    const app = window.__APP_INSTANCE__;
    if (app && app.handleClick) {
      app.handleClick(event);
    }
  },
  
  handleReset: function(event) {
    const app = window.__APP_INSTANCE__;
    if (app && app.handleReset) {
      app.handleReset(event);
    }
  },
  
  handleToggleMessage: function(event) {
    const app = window.__APP_INSTANCE__;
    if (app && app.handleToggleMessage) {
      app.handleToggleMessage(event);
    }
  }
};
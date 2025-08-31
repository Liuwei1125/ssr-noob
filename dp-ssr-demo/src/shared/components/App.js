import React from 'react';

const App = () => {
    
    return (
        <>
        <div className="app">
            <h1>我的第一个SSR应用</h1>
            <p>这是服务端渲染的内容</p>
            <button onClick={() => console.log('客户端JavaScript正常工作!')}>
                测试按钮
            </button>
        </div>
        <script>
            console.log(window.location.href);
        </script>
        </>
    );
};

export default App;

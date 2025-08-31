// 客户端JavaScript，用于在服务器渲染后增强页面功能
console.log('客户端JavaScript已加载，演示CSR增强功能');

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 动态添加客户端渲染的内容
    const mainContent = document.querySelector('main .content');
    
    // 创建一个客户端渲染的内容区域
    const csrDiv = document.createElement('div');
    csrDiv.className = 'csr-content';
    csrDiv.innerHTML = `
        <h3>客户端渲染(CSR)增强内容</h3>
        <p>这部分内容是在页面加载后，由客户端JavaScript动态生成的。</p>
        <p>当前时间: <span id="current-time"></span></p>
        <button id="update-time-btn">更新时间</button>
    `;
    
    // 将客户端渲染的内容添加到页面中
    mainContent.appendChild(csrDiv);
    
    // 更新时间函数
    function updateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        timeElement.textContent = now.toLocaleString('zh-CN');
    }
    
    // 初始更新时间
    updateTime();
    
    // 添加按钮点击事件
    const updateBtn = document.getElementById('update-time-btn');
    updateBtn.addEventListener('click', updateTime);
    
    // 给用户列表项添加交互效果
    const userItems = document.querySelectorAll('.user-list li');
    userItems.forEach(item => {
        // 添加点击效果
        item.addEventListener('click', function() {
            alert(`你点击了用户: ${this.querySelector('.user-name').textContent}`);
        });
        
        // 添加鼠标悬停效果
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f0f0f0';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });
    
    // 演示客户端路由
    const navigationLinks = document.querySelectorAll('nav a');
    navigationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // 在真实应用中，这里会进行路由跳转
            // 这里只是演示，显示一个提示
            alert(`客户端路由: 正在导航到 ${href}`);
        });
    });
});
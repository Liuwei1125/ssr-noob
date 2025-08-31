// Node.js服务器端渲染(SSR)实现示例
const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// 服务器配置
const config = {
    usePipeForResponse: true, // 设置为true启用pipe方式返回
    useBinaryResponse: true, // 设置为true启用二进制方式返回
};

// 数据库连接
const db = new sqlite3.Database('../nest-csr/db.sqlite', (err) => {
    if (err) {
        console.error('连接数据库时出错:', err.message);
    } else {
        console.log('已成功连接到SQLite数据库');
        if (config.useBinaryResponse) {
            console.log('响应模式: 二进制方式');
        } else if (config.usePipeForResponse) {
            console.log('响应模式: pipe方式');
        } else {
            console.log('响应模式: res.end()方式');
        }
    }
});

// 从数据库获取用户数据的函数
function getUsersFromDatabase(callback) {
    const sql = 'SELECT id, name, email FROM "user"';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('查询用户数据时出错:', err.message);
            callback([]);
        } else {
            // 映射数据格式以匹配模板需求
            const users = rows.map(row => ({
                id: row.id,
                name: row.name,
                email: row.email
            }));
            callback(users);
        }
    });
}

// 基础数据
const baseData = {
    title: 'SSR vs CSR 对比演示',
    heading: '服务器端渲染(SSR)基础教程',
    content: '这是一个使用Node.js原生实现的服务器端渲染示例。本页面的HTML内容是在服务器端生成并发送到客户端的，用户数据来自SQLite数据库。',
    year: new Date().getFullYear()
};

// 简单的模板渲染函数
function renderTemplate(templatePath, data) {
    // 读取HTML模板文件
    const template = fs.readFileSync(templatePath, 'utf8');
    
    // 替换模板中的占位符
    let renderedHtml = template
        .replace(/{{ title }}/, data.title)
        .replace(/{{ heading }}/, data.heading)
        .replace(/{{ content }}/, data.content)
        .replace(/{{ year }}/, data.year);
    
    // 生成用户列表HTML
    const usersHtml = data.users.map(user => 
        `<li class="user-item">
            <div class="user-info">
                <span class="user-name">${user.name}</span>
                <span class="user-email">${user.email}</span>
            </div>
        </li>`
    ).join('');
    
    // 替换用户列表占位符
    renderedHtml = renderedHtml.replace(/{{ users }}/, usersHtml);
    
    return renderedHtml;
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    console.log(`接收到请求: ${req.url}`);
    
    // 处理根路径请求，返回SSR页面
    if (req.url === '/') {
        try {
            // 从数据库获取用户数据
            getUsersFromDatabase((users) => {
                // 合并基础数据和用户数据
                const data = {
                    ...baseData,
                    users: users.length > 0 ? users : [
                        { id: 1, name: '张三', email: 'zhangsan@example.com' },
                        { id: 2, name: '李四', email: 'lisi@example.com' }
                    ] // 如果数据库中没有数据，使用默认数据
                };
                
                // 渲染HTML模板
                const html = renderTemplate(path.join(__dirname, 'views', 'index.html'), data);
                
                // 设置响应头
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                
                // 根据配置选择响应方式
                if (config.useBinaryResponse) {
                    // 使用二进制形式返回内容
                    console.log('使用二进制形式返回HTML内容');
                    // 将HTML字符串转换为Buffer
                    const htmlBuffer = Buffer.from(html, 'utf8');
                    // 发送二进制数据
                    res.end(htmlBuffer);
                } else if (config.usePipeForResponse) {
                    // 使用pipe方式返回内容
                    console.log('使用pipe方式返回HTML内容');
                    
                    // 创建一个可读流
                    const { Readable } = require('stream');
                    const htmlStream = new Readable({
                        read() {}
                    });
                    
                    // 将HTML内容推送到流中
                    htmlStream.push(html);
                    htmlStream.push(null); // 结束流
                    
                    // 将流通过pipe发送给响应对象
                    htmlStream.pipe(res);
                } else {
                    // 使用传统的res.end()方式返回内容
                    console.log('使用res.end()方式返回HTML内容');
                    res.end(html);
                }
            });
        } catch (error) {
            console.error('渲染模板时出错:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('服务器内部错误');
        }
    }
    // 处理静态文件请求
    else if (req.url.startsWith('/styles.css') || req.url.startsWith('/app.js')) {
        const filePath = path.join(__dirname, 'public', req.url);
        
        // 检查文件是否存在
        if (fs.existsSync(filePath)) {
            // 读取文件并发送
            const fileStream = fs.createReadStream(filePath);
            
            // 设置适当的内容类型
            const contentType = req.url.endsWith('.css') 
                ? 'text/css; charset=utf-8' 
                : 'application/javascript; charset=utf-8';
            
            res.writeHead(200, { 'Content-Type': contentType });
            fileStream.pipe(res);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('文件未找到');
        }
    }
    // 处理404错误
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('页面未找到');
    }
});

// 启动服务器
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`SSR服务器已启动，访问 http://localhost:${PORT}`);
    console.log('\n--- 服务器端渲染(SSR)与客户端渲染(CSR)对比 ---');
    console.log('1. SSR优势: 首屏加载快、SEO友好、减少客户端JavaScript负担');
    console.log('2. CSR优势: 交互性能好、前后端分离、开发体验佳');
    console.log('3. 本示例展示: 服务器生成完整HTML，客户端JavaScript增强交互');
    console.log('\n查看页面源代码可以看到服务器渲染的完整HTML内容。');
});
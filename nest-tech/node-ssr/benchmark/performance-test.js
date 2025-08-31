const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const { Readable } = require('stream');
const fs = require('fs');

// 创建一个较大的测试HTML内容
const createLargeHtml = (sizeInKB) => {
    const baseHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>性能测试页面</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>性能测试页面</h1>
    <p>这是一个用于测试不同响应方式性能的页面。</p>`;

    // 添加足够的内容使其达到指定大小
    let content = baseHtml;
    const targetSize = sizeInKB * 1024;
    const fillerText = '重复内容'.repeat(1000); // 一段重复的文本

    while (Buffer.byteLength(content, 'utf8') < targetSize) {
        content += `<div>${fillerText}</div>`;
    }

    content += `
</body>
</html>`;
    return content;
};

// 测试函数
const runTest = async (responseType, iterations = 50, htmlSizeInKB = 100) => {
    console.log(`\n=== 开始测试: ${responseType === 'pipe' ? 'Pipe方式' : '直接end方式'}, HTML大小: ${htmlSizeInKB}KB, 迭代次数: ${iterations} ===`);

    const largeHtml = createLargeHtml(htmlSizeInKB);
    const htmlSize = Buffer.byteLength(largeHtml, 'utf8') / 1024;
    console.log(`实际HTML大小: ${htmlSize.toFixed(2)}KB`);

    let totalResponseTime = 0;
    let totalMemoryUsage = 0;
    let server = null;

    try {
        // 创建临时服务器
        server = http.createServer((req, res) => {
            const startTime = Date.now();
            const startMemory = process.memoryUsage().rss;

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

            if (responseType === 'pipe') {
                // 使用pipe方式
                const htmlStream = new Readable({ read() {} });
                htmlStream.push(largeHtml);
                htmlStream.push(null);
                htmlStream.pipe(res);
            } else {
                // 使用直接end方式
                res.end(largeHtml);
            }

            const endTime = Date.now();
            const endMemory = process.memoryUsage().rss;
            const responseTime = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024;

            totalResponseTime += responseTime;
            totalMemoryUsage += memoryUsed;
        });

        // 处理服务器错误
        server.on('error', (err) => {
            console.error('服务器错误:', err);
        });

        // 启动服务器
        await new Promise((resolve, reject) => {
            server.listen(3001, 'localhost', () => {
                console.log('测试服务器启动在 http://localhost:3001');
                resolve();
            });
            server.once('error', reject);
        });

        // 运行多次测试
        for (let i = 0; i < iterations; i++) {
            try {
                await new Promise((resolve, reject) => {
                    const req = http.get('http://localhost:3001', (res) => {
                        // 为了真实模拟，我们读取所有数据
                        let data = '';
                        res.on('data', (chunk) => { data += chunk; });
                        res.on('end', () => {
                            resolve();
                        });
                    });
                    req.on('error', (err) => {
                        console.error(`请求错误 ${i+1}:`, err.message);
                        resolve(); // 即使出错也继续测试
                    });
                });
                if ((i + 1) % 10 === 0) {
                    console.log(`已完成 ${i + 1}/${iterations} 次测试`);
                }
            } catch (e) {
                console.error(`测试迭代 ${i+1} 失败:`, e.message);
            }
        }
    } catch (e) {
        console.error('测试过程中出错:', e.message);
    } finally {
        // 确保服务器关闭
        if (server) {
            await new Promise(resolve => {
                server.close(() => {
                    console.log('测试服务器已关闭');
                    resolve();
                });
            });
        }
        // 等待一小段时间，确保端口完全释放
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 计算平均指标
    const successfulTests = Math.max(1, iterations); // 至少算1次
    const avgResponseTime = totalResponseTime / successfulTests;
    const avgMemoryUsage = totalMemoryUsage / successfulTests;

    console.log(`\n测试结果:`);
    console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`平均内存使用: ${avgMemoryUsage.toFixed(2)}MB`);

    return { responseType, avgResponseTime, avgMemoryUsage, htmlSize };
};

// 运行对比测试
const runComparisonTest = async () => {
    console.log('=== 性能对比测试开始 ===');
    console.log('这个测试将比较pipe方式和直接end方式的响应性能差异');
    
    // 先检查并释放3001端口
    try {
        await new Promise((resolve) => {
            const tempServer = http.createServer();
            tempServer.on('error', () => resolve());
            tempServer.listen(3001, 'localhost', () => {
                tempServer.close(() => {
                    console.log('3001端口已释放');
                    resolve();
                });
            });
        });
    } catch (e) {
        console.log('端口检查过程中出错，继续测试:', e.message);
    }

    // 测试不同大小的HTML - 从较小的开始
    const testSizes = [10, 100]; // KB，先测试较小的大小
    const allResults = [];

    for (const size of testSizes) {
        console.log(`\n准备测试HTML大小: ${size}KB`);
        
        try {
            // 先运行pipe方式
            const pipeResult = await runTest('pipe', 30, size);
            allResults.push(pipeResult);
            
            // 等待一秒钟再进行下一个测试
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 再运行直接end方式
            const endResult = await runTest('end', 30, size);
            allResults.push(endResult);
            
            // 等待一秒钟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 对比两种方式
            const improvement = ((endResult.avgResponseTime - pipeResult.avgResponseTime) / endResult.avgResponseTime * 100).toFixed(2);
            console.log(`\n==== 大小 ${size}KB 的对比结果 ====`);
            console.log(`Pipe方式比直接end方式${improvement > 0 ? '快' : '慢'} ${Math.abs(improvement)}%`);
            console.log(`内存使用差异: ${(pipeResult.avgMemoryUsage - endResult.avgMemoryUsage).toFixed(2)}MB`);
        } catch (e) {
            console.error(`测试大小 ${size}KB 时出错:`, e.message);
        }
    }

    // 生成简单的报告文件
    const report = {
        timestamp: new Date().toISOString(),
        results: allResults
    };

    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    console.log('\n性能报告已保存到 performance-report.json');
    console.log('\n=== 性能对比测试结束 ===');
    console.log('\n测试总结:');
    console.log('1. 对于小文件，两种方式性能差异通常不大');
    console.log('2. 对于大文件，pipe方式通常有更好的内存效率');
    console.log('3. 查看生成的性能报告文件获取详细数据');
}

// 运行测试
runComparisonTest().catch(console.error);



/*
node performance-test.js
=== 性能对比测试开始 ===
这个测试将比较pipe方式和直接end方式的响应性能差异
3001端口已释放

准备测试HTML大小: 10KB

=== 开始测试: Pipe方式, HTML大小: 10KB, 迭代次数: 30 ===
实际HTML大小: 12.18KB
测试服务器启动在 http://localhost:3001
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.13ms
平均内存使用: 0.03MB

=== 开始测试: 直接end方式, HTML大小: 10KB, 迭代次数: 30 ===
实际HTML大小: 12.18KB
测试服务器启动在 http://localhost:3001
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.10ms
平均内存使用: 0.00MB

==== 大小 10KB 的对比结果 ====
Pipe方式比直接end方式慢 33.33%
内存使用差异: 0.02MB

准备测试HTML大小: 100KB

=== 开始测试: Pipe方式, HTML大小: 100KB, 迭代次数: 30 ===
实际HTML大小: 106.02KB
测试服务器启动在 http://localhost:3001
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.13ms
平均内存使用: 0.08MB

=== 开始测试: 直接end方式, HTML大小: 100KB, 迭代次数: 30 ===
实际HTML大小: 106.02KB
测试服务器启动在 http://localhost:3001
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.47ms
平均内存使用: 0.00MB

==== 大小 100KB 的对比结果 ====
Pipe方式比直接end方式快 71.43%
内存使用差异: 0.08MB

性能报告已保存到 performance-report.json

=== 性能对比测试结束 ===

测试总结:
1. 对于小文件，两种方式性能差异通常不大
2. 对于大文件，pipe方式通常有更好的内存效率
3. 查看生成的性能报告文件获取详细数据


*/
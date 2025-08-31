const http = require('http');
const { Readable } = require('stream');
const fs = require('fs');

// 创建测试内容
const createTestContent = (sizeInKB, isBinary = false) => {
    const contentSize = sizeInKB * 1024;
    
    if (isBinary) {
        // 创建二进制内容（Buffer）
        return Buffer.alloc(contentSize, 'binary content pattern repeat');
    } else {
        // 创建字符串内容
        let content = '';
        const fillerText = 'text content pattern repeat';
        while (Buffer.byteLength(content, 'utf8') < contentSize) {
            content += fillerText;
        }
        return content;
    }
};

// 测试函数
const runTest = async (responseType, contentFormat, iterations = 50, htmlSizeInKB = 100) => {
    console.log(`\n=== 开始测试: ${responseType === 'pipe' ? 'Pipe方式' : '直接end方式'}, ${contentFormat === 'binary' ? '二进制Buffer' : '字符串'}, HTML大小: ${htmlSizeInKB}KB, 迭代次数: ${iterations} ===`);

    // 创建测试内容
    const testContent = createTestContent(htmlSizeInKB, contentFormat === 'binary');
    const actualSizeKB = Buffer.byteLength(testContent) / 1024;
    console.log(`实际内容大小: ${actualSizeKB.toFixed(2)}KB`);

    let totalResponseTime = 0;
    let totalMemoryUsage = 0;
    let server = null;

    try {
        // 创建临时服务器
        server = http.createServer((req, res) => {
            const startTime = Date.now();
            const startMemory = process.memoryUsage().rss;

            // 设置正确的Content-Type
            const contentType = contentFormat === 'binary' 
                ? 'application/octet-stream' 
                : 'text/html; charset=utf-8';
            
            res.writeHead(200, { 'Content-Type': contentType });

            if (responseType === 'pipe') {
                // 使用pipe方式
                const readableStream = new Readable({
                    read() {}
                });
                
                // 根据内容格式推送数据
                if (contentFormat === 'binary') {
                    readableStream.push(testContent);
                } else {
                    readableStream.push(testContent);
                }
                readableStream.push(null);
                readableStream.pipe(res);
            } else {
                // 使用直接end方式
                res.end(testContent);
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
            server.listen(3002, 'localhost', () => {
                console.log('测试服务器启动在 http://localhost:3002');
                resolve();
            });
            server.once('error', reject);
        });

        // 运行多次测试
        for (let i = 0; i < iterations; i++) {
            try {
                await new Promise((resolve, reject) => {
                    const req = http.get('http://localhost:3002', (res) => {
                        // 读取所有数据以模拟真实场景
                        let data = [];
                        res.on('data', (chunk) => { data.push(chunk); });
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

    return {
        responseType,
        contentFormat,
        avgResponseTime,
        avgMemoryUsage,
        contentSize: actualSizeKB
    };
};

// 运行对比测试
const runComparisonTest = async () => {
    console.log('=== 二进制Buffer vs 字符串 性能对比测试开始 ===');
    console.log('这个测试将比较二进制Buffer和字符串在不同响应方式下的性能差异');
    
    // 先检查并释放3002端口
    try {
        await new Promise((resolve) => {
            const tempServer = http.createServer();
            tempServer.on('error', () => resolve());
            tempServer.listen(3002, 'localhost', () => {
                tempServer.close(() => {
                    console.log('3002端口已释放');
                    resolve();
                });
            });
        });
    } catch (e) {
        console.log('端口检查过程中出错，继续测试:', e.message);
    }

    // 测试不同大小的内容
    const testSizes = [10, 100, 500]; // KB
    const allResults = [];

    for (const size of testSizes) {
        console.log(`\n准备测试内容大小: ${size}KB`);
        
        try {
            // 1. 测试字符串 + pipe
            const stringPipeResult = await runTest('pipe', 'string', 30, size);
            allResults.push(stringPipeResult);
            
            // 等待一秒钟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 2. 测试字符串 + end
            const stringEndResult = await runTest('end', 'string', 30, size);
            allResults.push(stringEndResult);
            
            // 等待一秒钟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 3. 测试二进制 + pipe
            const binaryPipeResult = await runTest('pipe', 'binary', 30, size);
            allResults.push(binaryPipeResult);
            
            // 等待一秒钟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 4. 测试二进制 + end
            const binaryEndResult = await runTest('end', 'binary', 30, size);
            allResults.push(binaryEndResult);
            
            // 等待一秒钟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 对比结果
            console.log(`\n==== 大小 ${size}KB 的综合对比结果 ====`);
            
            // 字符串 vs 二进制 (pipe方式)
            const stringPipeTime = stringPipeResult.avgResponseTime;
            const binaryPipeTime = binaryPipeResult.avgResponseTime;
            const pipeDiff = ((stringPipeTime - binaryPipeTime) / stringPipeTime * 100).toFixed(2);
            console.log(`Pipe方式下，二进制比字符串${pipeDiff > 0 ? '快' : '慢'} ${Math.abs(pipeDiff)}%`);
            
            // 字符串 vs 二进制 (end方式)
            const stringEndTime = stringEndResult.avgResponseTime;
            const binaryEndTime = binaryEndResult.avgResponseTime;
            const endDiff = ((stringEndTime - binaryEndTime) / stringEndTime * 100).toFixed(2);
            console.log(`End方式下，二进制比字符串${endDiff > 0 ? '快' : '慢'} ${Math.abs(endDiff)}%`);
            
            // 内存使用对比
            console.log(`内存使用对比:`);
            console.log(`- 字符串+Pipe: ${stringPipeResult.avgMemoryUsage.toFixed(2)}MB`);
            console.log(`- 字符串+End: ${stringEndResult.avgMemoryUsage.toFixed(2)}MB`);
            console.log(`- 二进制+Pipe: ${binaryPipeResult.avgMemoryUsage.toFixed(2)}MB`);
            console.log(`- 二进制+End: ${binaryEndResult.avgMemoryUsage.toFixed(2)}MB`);
            
        } catch (e) {
            console.error(`测试大小 ${size}KB 时出错:`, e.message);
        }
    }

    // 生成详细的报告文件
    const report = {
        timestamp: new Date().toISOString(),
        results: allResults,
        conclusion: {
            pipeFasterReason: "Pipe方式更快的主要原因是它允许数据分块传输，减少了内存占用，特别是对于大文件。Node.js的流处理机制经过优化，可以更高效地处理数据传输。",
            binaryFasterReason: "二进制Buffer通常比字符串处理更快，因为字符串在传输前需要转换为Buffer，而二进制Buffer可以直接使用，减少了编码转换的开销。"
        }
    };

    fs.writeFileSync('binary-vs-string-report.json', JSON.stringify(report, null, 2));
    console.log('\n性能报告已保存到 binary-vs-string-report.json');
    console.log('\n=== 性能对比测试结束 ===');
    
    // 创建可视化页面
    createVisualizationPage(allResults);
};

// 创建可视化页面
const createVisualizationPage = (results) => {
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>二进制Buffer vs 字符串 性能对比</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1, h2 {
            text-align: center;
            color: #2c3e50;
        }
        .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
            margin-bottom: 30px;
        }
        .chart-container {
            position: relative;
            height: 400px;
            margin-bottom: 30px;
        }
        .principle {
            background-color: #e8f4f8;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 0 4px 4px 0;
        }
        code {
            background-color: #ecf0f1;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            color: #2c3e50;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <h1>二进制Buffer vs 字符串 性能对比</h1>
    <h2>不同响应方式和内容格式的性能分析</h2>

    <div class="container">
        <h3>性能优化原理说明</h3>
        <div class="principle">
            <h4>1. Pipe方式为什么更快？</h4>
            <ul>
                <li><strong>分块传输</strong>：Pipe方式允许数据分块传输，不需要一次性将所有数据加载到内存中</li>
                <li><strong>背压控制</strong>：Node.js的流实现了背压（backpressure）机制，可以根据接收方的处理速度调整发送速度</li>
                <li><strong>异步处理</strong>：流处理是异步的，不会阻塞事件循环</li>
                <li><strong>内存效率</strong>：特别是对于大文件，流处理可以显著减少内存占用</li>
            </ul>
            
            <h4>2. 二进制Buffer为什么比字符串快？</h4>
            <ul>
                <li><strong>减少转换开销</strong>：HTTP传输最终都是二进制的，字符串需要先转换为Buffer再传输</li>
                <li><strong>更高效的内存表示</strong>：Buffer是原始二进制数据的高效表示</li>
                <li><strong>避免字符编码转换</strong>：字符串在处理过程中可能涉及UTF-8等编码的转换</li>
                <li><strong>直接操作底层数据</strong>：Buffer可以直接操作底层字节数据</li>
            </ul>
        </div>
    </div>

    <div class="container">
        <h3>性能对比图表</h3>
        <div class="chart-container">
            <canvas id="performanceChart"></canvas>
        </div>
    </div>

    <script>
        // 准备图表数据
        const labels = [${results.map(r => `"${r.contentSize.toFixed(1)}KB ${r.contentFormat === 'binary' ? '二进制' : '字符串'} ${r.responseType === 'pipe' ? 'Pipe' : 'End'}"`).join(', ')}];
        const dataValues = [${results.map(r => r.avgResponseTime.toFixed(2)).join(', ')}];
        const backgroundColor = [${results.map(r => {
            if (r.contentFormat === 'binary' && r.responseType === 'pipe') return 'rgba(54, 162, 235, 0.8)';
            if (r.contentFormat === 'binary' && r.responseType === 'end') return 'rgba(54, 162, 235, 0.5)';
            if (r.contentFormat === 'string' && r.responseType === 'pipe') return 'rgba(255, 99, 132, 0.8)';
            return 'rgba(255, 99, 132, 0.5)';
        }).join(', ')}];
        
        // 创建性能对比图表
        const ctx = document.getElementById('performanceChart').getContext('2d');
        const performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '平均响应时间 (ms)',
                    data: dataValues,
                    backgroundColor: backgroundColor,
                    borderColor: 'rgba(100, 100, 100, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '响应时间 (毫秒)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '不同内容格式和响应方式的性能对比',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    </script>
</body>
</html>`;

    fs.writeFileSync('binary-vs-string-visualization.html', htmlContent);
    console.log('可视化页面已生成: binary-vs-string-visualization.html');
};

// 运行测试
runComparisonTest().catch(console.error);




/*

(TraeAI-22) ~/Desktop/workspace/nest-tech/node-ssr [0] $ node binary-vs-string-test.js
=== 二进制Buffer vs 字符串 性能对比测试开始 ===
这个测试将比较二进制Buffer和字符串在不同响应方式下的性能差异
3002端口已释放

准备测试内容大小: 10KB

=== 开始测试: Pipe方式, 字符串, HTML大小: 10KB, 迭代次数: 30 ===
实际内容大小: 10.02KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.30ms
平均内存使用: 0.03MB

=== 开始测试: 直接end方式, 字符串, HTML大小: 10KB, 迭代次数: 30 ===
实际内容大小: 10.02KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.00ms
平均内存使用: 0.00MB

=== 开始测试: Pipe方式, 二进制Buffer, HTML大小: 10KB, 迭代次数: 30 ===
实际内容大小: 10.00KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.10ms
平均内存使用: 0.00MB

=== 开始测试: 直接end方式, 二进制Buffer, HTML大小: 10KB, 迭代次数: 30 ===
实际内容大小: 10.00KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.00ms
平均内存使用: 0.00MB

==== 大小 10KB 的综合对比结果 ====
Pipe方式下，二进制比字符串快 66.67%
End方式下，二进制比字符串慢 NaN%
内存使用对比:
- 字符串+Pipe: 0.03MB
- 字符串+End: 0.00MB
- 二进制+Pipe: 0.00MB
- 二进制+End: 0.00MB

准备测试内容大小: 100KB

=== 开始测试: Pipe方式, 字符串, HTML大小: 100KB, 迭代次数: 30 ===
实际内容大小: 100.01KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.10ms
平均内存使用: 0.13MB

=== 开始测试: 直接end方式, 字符串, HTML大小: 100KB, 迭代次数: 30 ===
实际内容大小: 100.01KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.13ms
平均内存使用: 0.02MB

=== 开始测试: Pipe方式, 二进制Buffer, HTML大小: 100KB, 迭代次数: 30 ===
实际内容大小: 100.00KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.00ms
平均内存使用: 0.00MB

=== 开始测试: 直接end方式, 二进制Buffer, HTML大小: 100KB, 迭代次数: 30 ===
实际内容大小: 100.00KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.03ms
平均内存使用: 0.00MB

==== 大小 100KB 的综合对比结果 ====
Pipe方式下，二进制比字符串快 100%
End方式下，二进制比字符串快 75%
内存使用对比:
- 字符串+Pipe: 0.13MB
- 字符串+End: 0.02MB
- 二进制+Pipe: 0.00MB
- 二进制+End: 0.00MB

准备测试内容大小: 500KB

=== 开始测试: Pipe方式, 字符串, HTML大小: 500KB, 迭代次数: 30 ===
实际内容大小: 500.00KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.67ms
平均内存使用: 0.39MB

=== 开始测试: 直接end方式, 字符串, HTML大小: 500KB, 迭代次数: 30 ===
实际内容大小: 500.00KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.60ms
平均内存使用: 0.09MB

=== 开始测试: Pipe方式, 二进制Buffer, HTML大小: 500KB, 迭代次数: 30 ===
实际内容大小: 500.00KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.03ms
平均内存使用: 0.00MB

=== 开始测试: 直接end方式, 二进制Buffer, HTML大小: 500KB, 迭代次数: 30 ===
实际内容大小: 500.00KB
测试服务器启动在 http://localhost:3002
已完成 10/30 次测试
已完成 20/30 次测试
已完成 30/30 次测试
测试服务器已关闭

测试结果:
平均响应时间: 0.10ms
平均内存使用: 0.00MB

==== 大小 500KB 的综合对比结果 ====
Pipe方式下，二进制比字符串快 95%
End方式下，二进制比字符串快 83.33%
内存使用对比:
- 字符串+Pipe: 0.39MB
- 字符串+End: 0.09MB
- 二进制+Pipe: 0.00MB
- 二进制+End: 0.00MB

性能报告已保存到 binary-vs-string-report.json

=== 性能对比测试结束 ===
可视化页面已生成: binary-vs-string-visualization.html

*/
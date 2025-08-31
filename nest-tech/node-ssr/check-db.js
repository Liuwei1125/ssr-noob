// 检查数据库表结构的脚本
const sqlite3 = require('sqlite3').verbose();

// 连接数据库
const db = new sqlite3.Database('../nest-csr/db.sqlite', (err) => {
    if (err) {
        console.error('连接数据库时出错:', err.message);
        process.exit(1);
    } else {
        console.log('已成功连接到SQLite数据库');
        checkUserTable();
    }
});

// 检查user表结构
function checkUserTable() {
    // 查询所有表名
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            console.error('查询表时出错:', err.message);
        } else {
            console.log('数据库中的表:', tables.map(t => t.name).join(', '));
        }
        
        // 检查user表是否存在
        const userTableExists = tables.some(t => t.name === 'user' || t.name === 'User');
        
        if (userTableExists) {
            // 查询user表结构
            db.all("PRAGMA table_info('user')", [], (err, columns) => {
                if (err) {
                    console.error('查询表结构时出错:', err.message);
                } else {
                    console.log('\nuser表结构:');
                    columns.forEach(col => {
                        console.log(`${col.name} (${col.type})`);
                    });
                }
                
                // 尝试查询用户数据
                console.log('\n尝试查询用户数据:');
                db.all("SELECT id, name, email FROM user LIMIT 5", [], (err, users) => {
                    if (err) {
                        console.error('查询用户数据时出错:', err.message);
                    } else {
                        console.log(`找到 ${users.length} 条用户记录`);
                        if (users.length > 0) {
                            console.log('前3条记录:');
                            users.slice(0, 3).forEach(user => {
                                console.log(`ID: ${user.id}, 姓名: ${user.name}, 邮箱: ${user.email}`);
                            });
                        }
                    }
                    
                    // 关闭数据库连接
                    db.close((err) => {
                        if (err) {
                            console.error('关闭数据库连接时出错:', err.message);
                        } else {
                            console.log('\n数据库连接已关闭');
                        }
                    });
                });
            });
        } else {
            console.log('\n未找到user表');
            // 检查是否有其他可能的用户表
            db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%user%'", [], (err, userTables) => {
                if (err) {
                    console.error('查询用户相关表时出错:', err.message);
                } else if (userTables.length > 0) {
                    console.log('找到可能的用户相关表:', userTables.map(t => t.name).join(', '));
                }
                
                // 关闭数据库连接
                db.close((err) => {
                    if (err) {
                        console.error('关闭数据库连接时出错:', err.message);
                    } else {
                        console.log('数据库连接已关闭');
                    }
                });
            });
        }
    });
}
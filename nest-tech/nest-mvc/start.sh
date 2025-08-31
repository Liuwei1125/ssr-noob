#!/bin/bash

# 确保脚本在出错时退出
set -e

# 打印启动信息
 echo "开始启动NestJS MVC演示项目..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
  echo "未找到node_modules目录，开始安装依赖..."
  npm install
fi

# 构建项目
 echo "开始构建项目..."
npm run build

# 启动项目
 echo "项目构建完成，开始启动服务器..."
npm run start

# 如果想在开发模式下启动，可以使用以下命令
# npm run start:dev
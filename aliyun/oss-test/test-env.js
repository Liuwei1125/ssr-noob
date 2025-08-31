// 简单的dotenv测试脚本
console.log('开始测试dotenv...');
const result = require('dotenv').config();

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
  console.log('Loaded variables:', Object.keys(result.parsed || {}));
  
  // 打印具体的环境变量值
  console.log('OSS_REGION:', process.env.OSS_REGION);
  console.log('OSS_ENDPOINT:', process.env.OSS_ENDPOINT);
  console.log('OSS_BUCKET:', process.env.OSS_BUCKET);
  console.log('OSS_ACCESS_KEY_ID exists:', !!process.env.OSS_ACCESS_KEY_ID);
  console.log('OSS_ACCESS_KEY_SECRET exists:', !!process.env.OSS_ACCESS_KEY_SECRET);
}
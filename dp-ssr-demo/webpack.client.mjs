import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（避免使用process.cwd()的潜在问题）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 客户端配置
export default {
    mode: 'development',
    entry: './src/client/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'client_bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx'] // 允许 webpack 自动解析这些扩展名
    }
};
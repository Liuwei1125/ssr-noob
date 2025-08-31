import path from 'path';
import nodeExternals from 'webpack-node-externals';

// 服务端配置
export default {
    mode: 'development',
    entry: './src/server/index.js',
    target: 'node',
    // 使用webpack-node-externals排除node_modules依赖，但配置为ES模块格式
    externals: [nodeExternals({
        // 指定外部依赖使用ES模块的import语法，而不是CommonJS的require
        importType: 'module',
        // 允许webpack识别ES模块的导入
        modulesDir: 'node_modules'
    })],
    output: {
        path: path.resolve(process.cwd(), 'dist'),
        filename: 'server_bundle.js',
        libraryTarget: 'module'
    },
    experiments: {
        outputModule: true
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
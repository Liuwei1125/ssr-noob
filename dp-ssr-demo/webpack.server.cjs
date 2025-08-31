const path = require('path');
const nodeExternals = require('webpack-node-externals');

// 服务端配置
module.exports = {
    mode: 'development',
    entry: './src/server/index.js',
    target: 'node',
    externals: [nodeExternals({
        allowlist: ['webpack/hot/poll?300'] // 白名单，防止 webpack 打包时，将热更新相关的代码打包进 bundle
    })], // 排除node_modules，用于 Node.js 环境的打包，遇到 node_modules 里的依赖，不要打包进 bundle，而是保留 require()
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server_bundle.js'
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
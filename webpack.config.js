const path = require('path');


const nodeConfig = {
    target: 'node',
    entry: './src/sync-client.js',
    output: {
        filename: 'agility-sync-sdk.node.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2',
        libraryExport: 'default'
    },
    optimization: {
        minimize: false
    },
    module: {
        rules : [
        // JavaScript
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: ['babel-loader'],
        },
        // JavaScript
        {
            test: /\.js$/,
            exclude: /node_modules\/(?!@agility\/content-fetch)/, // Transpile @agility/content-fetch
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'], // Ensure compatibility with modern syntax
                }
            }
        }
        ]
    },
    // Plugins
    plugins: []
}

module.exports = nodeConfig
const path = require('path');


const nodeConfig = {
    target: 'node',
    entry: './src/sync-worker.js',
    output: {
        filename: 'agility-sync-sdk.node.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'agilitySync',
        libraryExport: 'default',
        umdNamedDefine: true,
        globalObject: 'typeof self !== \'undefined\' ? self : this'
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
        }
        ]
    },
    // Plugins
    plugins: []
}

module.exports = nodeConfig
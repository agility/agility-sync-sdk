const path = require('path');

const nodeConfig = {
    target: 'node',
    entry: './src/sync-client.ts',
    output: {
        filename: 'agility-sync-sdk.node.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'agilitySync',
            type: 'umd',
            export: 'default'
        },
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    optimization: {
        minimize: false,
        moduleIds: 'deterministic'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                ]
            }
        ]
    },
    plugins: []
}

module.exports = nodeConfig
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/main/resources/js/app.js',
    output: {
        filename: 'app-bundle.js',
        path: path.resolve(__dirname, 'target/classes/js')
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    }
};
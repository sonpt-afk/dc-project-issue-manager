const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        app: './src/main/resources/js/app.js',
        'project-settings-bundle': './src/main/resources/js/components/SettingsPage.jsx'
    },
    output: {
        filename: '[name].js',
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

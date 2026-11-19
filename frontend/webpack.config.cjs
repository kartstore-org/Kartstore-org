const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');

// Load frontend/.env for local builds; environment variables supplied by CI/deployments win.
dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';
  const apiUrl = process.env.KARTSTORE_API_URL
    || process.env.VITE_API_URL
    || 'http://localhost:5000/api/v1';

  return {
    entry: path.resolve(__dirname, 'src/main.jsx'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
      assetModuleFilename: 'assets/[name].[contenthash:8][ext][query]',
      publicPath: '/',
      clean: true,
    },
    resolve: { extensions: ['.js', '.jsx', '.json'] },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                ['@babel/preset-react', { runtime: 'automatic' }],
              ],
            },
          },
        },
        { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
        { test: /\.(png|jpe?g|gif|svg|webp|ico|woff2?)$/i, type: 'asset/resource' },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'index.html') }),
      new webpack.DefinePlugin({
        'process.env.KARTSTORE_API_URL': JSON.stringify(apiUrl),
      }),
    ],
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
    devServer: {
      host: '0.0.0.0',
      port: 5173,
      hot: true,
      historyApiFallback: true,
      static: { directory: path.resolve(__dirname, 'public') },
      client: { overlay: true },
    },
    performance: { hints: isProduction ? 'warning' : false },
  };
};

import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  devtool: isDev ? 'inline-source-map' : false,
  externals: {
    electron: 'commonjs2 electron',
    react: 'commonjs2 react',
    'react-dom': 'commonjs2 react-dom',
  },
  entry: {
    index: path.resolve('src', 'index.ts'),
    worker: path.resolve('src', 'google-drive.worker.ts'),
  },
  target: 'node',
  output: {
    path: path.resolve('dist'),
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: ['node_modules'],
    alias: {
      'elcommander-plugin-sdk': path.resolve(
        '..',
        'elcommander-plugin-sdk',
        'src'
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('babel-loader'),
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
};

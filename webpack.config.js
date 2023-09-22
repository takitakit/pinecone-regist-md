const path = require('path');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: './src/index.ts', // エントリーポイント
  module: {
    rules: [
      {
        test: /\.tsx?$/, // TypeScriptファイルの正規表現パターン
        use: 'ts-loader', // TypeScriptのローダー
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // 解決する拡張子
  },
  output: {
    filename: 'index.js', // 出力するファイル名
    path: path.resolve(__dirname, 'dist'), // 出力ディレクトリ
  },
};

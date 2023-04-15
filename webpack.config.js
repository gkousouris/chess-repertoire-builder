const path = require('path');

module.exports = {
  entry: './app.js', // Replace with the path to your application's entry point
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Replace with the path to your desired output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};

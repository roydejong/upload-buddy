const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'upbud.min.js',
    path: path.resolve(__dirname, './dist')
  }
};
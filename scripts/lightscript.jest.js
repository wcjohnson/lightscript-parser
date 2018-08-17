// Compile lsc to js
// See babel-jest plugin for more details

const babelCore = require('babel-core');

module.exports = {
  process(src, path) {
    if (path.endsWith('.lsc') || path.endsWith('.lsx')) {
      return babelCore.transform(src, {
        retainLines: true,
        sourceMaps: 'inline',
        filename: path
      }).code;
    }
    return src;
  },
};

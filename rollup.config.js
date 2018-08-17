import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
var fs = require('fs');
var path = require('path');

var srcPath = (path.resolve('./src')).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
var srcPathRegex = new RegExp(srcPath)

// Disable module transform when building for rollup
var babelRC = JSON.parse(fs.readFileSync('./.babelrc', { encoding: 'UTF-8'}))
babelRC.babelrc = false;
babelRC.presets[0][1].env.modules = false

// Add babel-external-helpers plugin, which helps rollup dedupe injected code
babelRC.presets[0][1].additionalPlugins = babelRC.presets[0][1].additionalPlugins || [];
babelRC.presets[0][1].additionalPlugins.push("babel-plugin-external-helpers");

// Istanbul code coverage
var coverage = false;
if (process.env.COVERAGE === "true") coverage = true;
if(coverage) {
  babelRC.presets[0][1].additionalPlugins.push("babel-plugin-istanbul");
}

// Attempt to determine if a module is external and should not be rolled into
// the bundle. Check for presence in source path, presence of "." in module path,
// or special module paths.
function isExternal(modulePath) {
  // "babelHelpers" must be treated as internal or babel-plugin-external-helpers will break
  if(/babelHelpers/.test(modulePath)) return false;

  // "." in module path = internal
  if(/\.\//.test(modulePath)) return false;

  // Otherwise, attempt to figure out whether the module is inside the source tree.
  modulePath = path.resolve(modulePath)
  return !(srcPathRegex.test(modulePath));
}

var getPlugins = () => [
  resolve({
    extensions: ['.js', '.lsc']
  }),
  babel(babelRC)
]

var withFormat = (format) => ({
  input: 'src/index.js',
  output: {
    file: format === "cjs" ? `lib/index.js` : `lib/index.${format}.js`,
    format: format,
    sourcemap: true
  },
  plugins: getPlugins(),
  external: isExternal
})

// Only build CJS
var formats = [withFormat("cjs")];

export default formats;

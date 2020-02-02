import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';

module.exports = {
  input: 'src/index.js',
  output: [{
    file: 'dist/bundle.es.js',
    format: 'es',
    sourcemap: true,
  }, {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'TextHighlighter',
    sourcemap: true,
  }],
  plugins: [
    resolve(),
    babel({ exclude: 'node_modules/**' }),
  ],
};

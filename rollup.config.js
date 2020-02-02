import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.es.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/bundle.js',
      format: 'iife',
      name: 'TextHighlighter',
      sourcemap: true,
    },
    {
      file: 'dist/bundle.min.js',
      format: 'iife',
      name: 'TextHighlighter',
    },
  ],
  plugins: [
    resolve(),
    babel({ exclude: 'node_modules/**' }),
    terser({
      include: [/^.+\.min\.js$/],
    }),
  ],
};

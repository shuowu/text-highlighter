import resolve from '@rollup/plugin-node-resolve';

module.exports = [
  {
    input: 'src/index.js',
    output: [{
      file: 'dist/bundle.esm.js',
      format: 'esm',
    }, {
      file: 'dist/bundle.js',
      format: 'iife',
      globals: {
        window: 'window',
      },
    }],
    watch: {
      exclude: 'node_modules/**',
    },
    plugins: [resolve()],
  },
];

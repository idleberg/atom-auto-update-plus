import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import scss from 'rollup-plugin-scss'
import typescript from '@rollup/plugin-typescript';

const production = !process.env.ROLLUP_WATCH;

const plugins = [
  babel({
    extensions: ['.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx'],
    babelHelpers: 'bundled',
  }),
  commonjs(),
  json(),
  nodeResolve({
    preferBuiltins: true
  }),
  production && terser(),
  scss({
    output: false
  }),
  typescript({
    allowSyntheticDefaultImports: true,
    moduleResolution: 'node',
    resolveJsonModule: true
  })
];

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'lib',
      exports: 'default',
      format: 'cjs',
      sourcemap: production ? false : true
    },
    external: [
      // Atom
      'atom',
      'electron'
    ],
    plugins: plugins
  }
];

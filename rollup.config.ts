import { defineConfig } from 'rollup';
import typescriptPlugin from '@rollup/plugin-typescript';
import scssPlugin from 'rollup-plugin-scss';
import copyPlugin from 'rollup-plugin-copy';
import del from 'del';

export default async function () {
  await del(['build']);

  return defineConfig([
    {
      input: ['src/script/index.ts'],
      plugins: [
        copyPlugin({
          targets: [{ src: 'src/index.html', dest: 'build' }],
        }),
        scssPlugin({ output: 'build/styles.css' }),
        typescriptPlugin({ outputToFilesystem: true }),
      ],
      output: {
        dir: 'build',
        format: 'esm',
      },
    },
  ]);
}

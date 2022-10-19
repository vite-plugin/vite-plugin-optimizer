import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { strict as assert } from 'node:assert';
import { build } from 'vite';
import libEsm from 'lib-esm';
import optimizer from '../index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destpath = path.join(__dirname, '__snapshots__');
const resolveId = '.vite-plugin-optimizer/path';
const modulePath = path.join(__dirname, '../node_modules', resolveId + '.mjs');
const exports = Object.keys(path);

fs.rmSync(destpath, { recursive: true, force: true });
fs.mkdirSync(destpath, { recursive: true });

await build({
  root: __dirname,
  build: {
    minify: false,
    outDir: '',
    emptyOutDir: false,
    lib: {
      entry: '-.js',
      formats: ['es'],
      fileName: () => `[name].mjs`,
    },
    rollupOptions: {
      external: resolveId,
    },
  },
  plugins: [
    optimizer({
      path: () => {
        const result = libEsm({ require: 'path', exports });
        return `${result.require}\n${result.exports}`;
      },
    }, {
      // filename.js -> filename.mjs
      resolveId: id => id.replace('.js', '.mjs'),
    }),
  ],
});

const optimizePath = await import(modulePath);

for (const key of Object.keys(optimizePath)) {
  if (key === 'default') continue;
  assert.equal(exports.includes(key), true);
}

fs.createReadStream(modulePath).pipe(fs.createWriteStream(path.join(destpath, 'path.mjs')));

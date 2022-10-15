import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import libEsm from 'lib-esm'

// const iswatch = process.argv.slice(2).includes('--watch');
const CJS = {
  __filename: fileURLToPath(import.meta.url),
  __dirname: path.dirname(fileURLToPath(import.meta.url)),
  require: createRequire(import.meta.url),
};

const filename = path.join(CJS.__dirname, 'index.js');
const destname = filename.replace('.js', '.mjs');
const result = libEsm({ lib: './index.js', members: Object.keys(CJS.require('.')) });
fs.writeFileSync(destname, result.snippet);

console.log('build success');

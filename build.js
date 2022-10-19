const fs = require('fs');
const path = require('path');
const libEsm = require('lib-esm');

// const iswatch = process.argv.slice(2).includes('--watch');
const filename = path.join(__dirname, 'index.js');
const destname = filename.replace('.js', '.mjs');
const result = libEsm({ require: './index.js', exports: Object.keys(require('.')) });
fs.writeFileSync(destname, `${result.require}\n${result.exports}`);

console.log('build success');

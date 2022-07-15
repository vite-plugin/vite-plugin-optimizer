const fs = require('fs');
const path = require('path');

const DIR = '.vite-plugin-optimizer';
const EXT = '.js';

/**
 * @type {import('.').VitePluginOptimizer}
 */
module.exports = function optimizer(entries, options = {}) {
  if (typeof options.dir === 'undefined') options.dir = DIR;
  let root = process.cwd();

  return {
    name: 'vite-plugin-optimizer',
    async config(config) {
      // https://github.com/vitejs/vite/blob/a2b313126abdf2e0652502cbcd4b94353c37f91a/packages/vite/src/node/config.ts#L442-L445
      if (config.root) root = path.resolve(config.root);
      if (!path.isAbsolute(options.dir)) options.dir = path.join(node_modules(root), options.dir);
      if (!fs.existsSync(options.dir)) fs.mkdirSync(options.dir, { recursive: true });

      if (!config.optimizeDeps) config.optimizeDeps = {};
      if (!config.optimizeDeps.include) config.optimizeDeps.include = [];
      if (!config.optimizeDeps.exclude) config.optimizeDeps.exclude = [];

      if (!config.resolve) config.resolve = {};
      if (!config.resolve.alias) config.resolve.alias = [];
      if (typeof config.resolve.alias === 'object') {
        config.resolve.alias = Object
          .entries(config.resolve.alias)
          .reduce((memo, [find, replacement]) => memo.concat({ find, replacement }), []);
      }

      // If the module is already in `optimizeDeps.include`, it should be filtered out
      const include = config.optimizeDeps.include;
      if (include.length) {
        const keys = Object.keys(entries).filter(key => !include.includes(key));
        entries = Object
          .entries(entries)
          .filter(([key]) => keys.includes(key))
          .reduce((memo, [key, val]) => Object.assign(memo, { [key]: val }), {});
      }

      // Pre-building modules
      const generateRecords = await generateModule(entries, options);

      for (const record of generateRecords) {

        // Insert optimize module to `optimizeDeps.exclude`
        // You can avoid it by `optimizeDeps.include`
        config.optimizeDeps.exclude.push(record.module);

        // avoid vite builtin 'vite:resolve' plugin by alias
        config.resolve.alias.push({
          find: record.module,
          replacement: record.filename,
          ...record.alias,
        });

      }
    },
  }
}

/**
 * @type {import('.').GenerateModule}
 */
async function generateModule(entries, options) {
  const dir = options.dir; // Here, must be absolute path.

  /**
   * @type {import('.').GenerateRecord[]}
   */
  const generateRecords = [];
  for (const [module, variableType] of Object.entries(entries)) {
    if (!variableType) continue;

    // `/project/node_modules/.vite-plugin-optimizer/${module}.js`
    let filename = path.join(dir, module) + EXT;

    if (options.resolveId) {
      const tmp = options.resolveId(filename);
      if (tmp) filename = tmp;
    }

    let moduleContent = null;
    /**
     * @type {import('.').GenerateRecord}
     */
    let record = { module, filename };

    if (typeof variableType === 'function') {
      const tmp = await variableType({ dir });
      if (!tmp) continue;
      if (typeof tmp === 'object') {
        tmp.code && (moduleContent = tmp.code);
        tmp.alias && (record.alias = tmp.alias);
      } else {
        moduleContent = tmp; // string
      }
    } else if (typeof variableType === 'object') {
      variableType.code && (moduleContent = variableType.code);
      variableType.alias && (record.alias = variableType.alias);
    } else {
      moduleContent = variableType; // string
    }

    if (moduleContent) {
      // Support nest moduleId '@scope/name'
      ensureDir(path.join(filename, '..'));
      fs.writeFileSync(filename, moduleContent);
    }

    if (moduleContent || record.alias) {
      generateRecords.push(record);
    }
  }
  return generateRecords;
}

// --------- utils ---------

function ensureDir(dir) {
  if (!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function node_modules(root, count = 0) {
  if (node_modules.p) {
    return node_modules.p;
  }
  const p = path.join(root, 'node_modules');
  if (fs.existsSync(p)) {
    return node_modules.p = p;
  }
  if (count >= 19) {
    throw new Error('Can not found node_modules directory.');
  }
  return node_modules(path.join(root, '..'), count + 1);
}

declare module 'vite-plugin-optimizer' {
  export interface OptimizerArgs {
    /** Generated file cache directory */
    dir: string;
  }

  export interface ResultDescription {
    /**
     * This is consistent with the `alias` behavior.
     * 
     * e.g.  
     *   `import fs from 'fs'`  
     *   or  
     *   `import fs from 'node:fs'`  
     * 
     * @example
     * {
     *   // This means that both 'fs' and 'node:fs' are supported.
     *   find: /^(node:)?fs$/,
     *   replacement: '/project/node_modules/.vite-plugin-optimizer/fs.js',
     * }
     */
    alias?: {
      find: string | RegExp;
      /**
       * If not explicitly specified, will use the path to the generated file as the default.
       */
      replacement?: string;
    };
    code?: string;
  }

  export interface Entries {
    [moduleId: string]:
    | string
    | ResultDescription
    | ((args: OptimizerArgs) => string | ResultDescription | Promise<string | ResultDescription | void> | void);
  }

  export interface OptimizerOptions {
    /**
     * @default ".vite-plugin-optimizer"
     */
    dir?: string;
    resolveId?: ((id: string) => string | Promise<string | void> | void);
  }

  // --------- utils ---------

  export type GenerateRecord = {
    alias?: ResultDescription['alias'];
    module: string;
    // Absolute path of file
    filename: string;
  };

  export interface GenerateModule {
    (entries: Entries, options?: OptimizerOptions): Promise<GenerateRecord[]>;
  }

  const optimizer: ((entries: Entries, options?: OptimizerOptions) => import('vite').Plugin);
  export default optimizer;
}

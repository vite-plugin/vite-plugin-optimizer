import { createRequire } from "node:module";
const _M_ = createRequire(import.meta.url)("path");
export const resolve = _M_.resolve;
export const normalize = _M_.normalize;
export const isAbsolute = _M_.isAbsolute;
export const join = _M_.join;
export const relative = _M_.relative;
export const toNamespacedPath = _M_.toNamespacedPath;
export const dirname = _M_.dirname;
export const basename = _M_.basename;
export const extname = _M_.extname;
export const format = _M_.format;
export const parse = _M_.parse;
export const sep = _M_.sep;
export const delimiter = _M_.delimiter;
export const win32 = _M_.win32;
export const posix = _M_.posix;
export const _makeLong = _M_._makeLong;
const keyword_default = _M_.default || _M_;
export {
  keyword_default as default,
};
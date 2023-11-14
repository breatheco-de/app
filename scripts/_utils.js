import { promisify } from 'util';
import { resolve } from 'path';
import fs from 'fs';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function walk(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? walk(res) : res;
    }),
  );
  return files.reduce((a, f) => a.concat(f), []);
}

const fail = (msg, ...params) => {
  console.log(msg, ...params);
  process.exit(1);
};

const warn = (msg, ...params) => {
  console.warn(msg, ...params);
  process.exit(0);
};

const success = (msg, ...params) => {
  console.log(msg, ...params);
  process.exit(0);
};

export {
  walk,
  fail,
  warn,
  success,
};

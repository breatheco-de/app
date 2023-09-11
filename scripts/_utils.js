const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
require('dotenv').config({
  path: '.env.production',
});

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

const WHITE_LABEL_ACADEMY = process.env.WHITE_LABEL_ACADEMY || '4';
const DOMAIN_NAME = process.env.DOMAIN_NAME || '';
const isWhiteLabelAcademy = typeof DOMAIN_NAME === 'string' && DOMAIN_NAME !== 'https://4geeks.com';

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

module.exports = {
  walk,
  fail,
  warn,
  success,
  WHITE_LABEL_ACADEMY,
  isWhiteLabelAcademy,
};

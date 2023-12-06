import { isDevMode } from './index';

export function log(...args) {
  if (isDevMode) {
    console.log(...args);
  }
}

export function warn(...args) {
  if (isDevMode) {
    console.warn(...args);
  }
}

export function error(...args) {
  if (isDevMode) {
    console.error(...args);
  }
}

export function info(...args) {
  if (isDevMode) {
    console.info(...args);
  }
}

export function debug(...args) {
  if (isDevMode) {
    console.debug(...args);
  }
}

import { beforeEach, describe, expect, test } from 'bun:test';
import { clearTokenCookie, getToken, setTokenCookie } from '../utils/sessionCookie';

// Minimal cookie jar that, like real browsers, rejects `domain=` on public suffixes.
const PUBLIC_SUFFIXES = ['.vercel.app'];
let jar = [];

const fakeDocument = {
  get cookie() {
    return jar.map(({ name, value }) => `${name}=${value}`).join('; ');
  },
  set cookie(raw) {
    const [pair, ...attrs] = raw.split('; ');
    const [name, value] = pair.split('=');
    const attributes = Object.fromEntries(attrs.map((a) => a.split('=')));
    const domain = attributes.domain || null;
    if (domain && PUBLIC_SUFFIXES.includes(domain)) return;

    jar = jar.filter((c) => !(c.name === name && c.domain === domain));
    if (attributes['max-age'] !== '0') jar.push({ name, value, domain });
  },
};

function setHost(hostname) {
  globalThis.window = { location: { hostname, protocol: 'https:', search: '' } };
}

globalThis.document = fakeDocument;
globalThis.localStorage = { getItem: () => null, removeItem: () => {} };

beforeEach(() => {
  jar = [];
});

describe('session cookies on a public-suffix host', () => {
  beforeEach(() => setHost('acme-app-kohl.vercel.app'));

  test('stores the token as a host-only cookie', () => {
    setTokenCookie('first');
    expect(getToken()).toBe('first');
    expect(jar).toEqual([{ name: '4g_tok', value: 'first', domain: null }]);
  });

  test('later writes replace the stored token', () => {
    setTokenCookie('first');
    setTokenCookie('second');
    expect(getToken()).toBe('second');
  });

  test('clearing removes the token', () => {
    setTokenCookie('first');
    clearTokenCookie();
    expect(getToken()).toBeNull();
  });
});

describe('session cookies on a shareable parent domain', () => {
  beforeEach(() => setHost('learn.4geeks.com'));

  test('stores the token on the parent domain only', () => {
    setTokenCookie('first');
    expect(getToken()).toBe('first');
    expect(jar).toEqual([{ name: '4g_tok', value: 'first', domain: '.4geeks.com' }]);
  });
});

describe('session cookies on localhost', () => {
  beforeEach(() => setHost('localhost'));

  test('stores the token as a host-only cookie', () => {
    setTokenCookie('first');
    expect(jar).toEqual([{ name: '4g_tok', value: 'first', domain: null }]);
  });
});

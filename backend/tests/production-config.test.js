import { test } from 'node:test';
import assert from 'node:assert/strict';
import { corsOptions } from '../src/config/http.js';

test('CORS usa origem sem subpasta e rejeita dominios externos', (t) => {
  const previous = { ...process.env };
  t.after(() => { process.env = previous; });
  process.env.NODE_ENV = 'production';
  process.env.FRONTEND_URL = 'https://frontend.invalid/tecti/2026/gpec11/';
  const options = corsOptions();
  options.origin('https://frontend.invalid', (error, allowed) => {
    assert.equal(error, null); assert.equal(allowed, true);
  });
  options.origin('https://untrusted.invalid', error => assert.equal(error.status, 403));
  options.origin(undefined, (error, allowed) => {
    assert.equal(error, null); assert.equal(allowed, true);
  });
});

test('producao exige FRONTEND_URL HTTPS', (t) => {
  const previous = { ...process.env };
  t.after(() => { process.env = previous; });
  process.env.NODE_ENV = 'production';
  delete process.env.FRONTEND_URL;
  assert.throws(() => corsOptions(), /FRONTEND_URL/);
  process.env.FRONTEND_URL = 'http://frontend.invalid';
  assert.throws(() => corsOptions(), /HTTPS/);
});

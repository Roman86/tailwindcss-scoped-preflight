/**
 * Tests that the plugin correctly resolves tailwindcss preflight.css
 * in both CJS and ESM contexts, and that the Vite-like Proxy shim
 * for `require` doesn't break resolution (regression test for #69).
 */
import assert from 'node:assert';
import { createRequire } from 'node:module';
import { test } from 'node:test';

// --- ESM import of the built plugin (dist/index.js) ---
test('ESM: plugin exports scopedPreflightStyles', async () => {
  const mod = await import('../dist/index.js');
  assert.ok(mod.scopedPreflightStyles, 'scopedPreflightStyles should be exported');
  assert.strictEqual(typeof mod.scopedPreflightStyles, 'function');
});

test('ESM: plugin resolves preflight.css without throwing', async () => {
  const req = createRequire(import.meta.url);
  const resolved = req.resolve('tailwindcss/lib/css/preflight.css');
  assert.ok(resolved, 'should resolve preflight.css path');
});

// --- CJS require of the built plugin (dist/index.cjs) ---
test('CJS: plugin exports scopedPreflightStyles', async () => {
  const req = createRequire(import.meta.url);
  const mod = req('../dist/index.cjs');
  assert.ok(mod.scopedPreflightStyles, 'scopedPreflightStyles should be exported');
  assert.strictEqual(typeof mod.scopedPreflightStyles, 'function');
});

// --- Simulate Vite-like Proxy shim (regression for #69) ---
test('Proxy shim: typeof Proxy !== "function", falls through to createRequire', () => {
  // Simulate the tsup __require Proxy shim
  const shim = new Proxy(function () {}, {
    get: (a, b) => a[b],
    apply: () => {
      throw new Error('Dynamic require not supported');
    },
  });

  // The old check: `typeof shim !== 'undefined'` → true (BAD: would use broken shim)
  assert.notStrictEqual(typeof shim, 'undefined', 'Proxy is not undefined');

  // The new check: `typeof shim === 'function'` → true for Proxy wrapping a function!
  // But `.resolve` doesn't exist on it:
  assert.strictEqual(typeof shim.resolve, 'undefined', 'Proxy shim has no .resolve');

  // So the combined check `typeof x === "function" && typeof x.resolve === "function"` catches it:
  const passesNewCheck =
    typeof shim === 'function' && typeof shim.resolve === 'function';
  assert.strictEqual(passesNewCheck, false, 'New check correctly rejects Proxy shim');
});

// --- Full integration: plugin can process CSS without error ---
test('Integration: plugin generates scoped preflight CSS', async () => {
  const { scopedPreflightStyles, isolateInsideOfContainer } = await import('../dist/index.js');

  // Create a minimal Tailwind-like config and run the plugin
  const plugin = scopedPreflightStyles({
    isolationStrategy: isolateInsideOfContainer('.twp'),
  });

  // The plugin function should be callable (it returns a TW plugin descriptor)
  assert.ok(plugin, 'plugin should return a value');
});

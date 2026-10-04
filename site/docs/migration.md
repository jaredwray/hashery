---
title: Migration
order: 9
description: Upgrade notes for Hashery v3 and v2.
---

## v2 to v3

v3 has no API changes. Classes, methods, options, hooks, and events behave as they did in v2.

The runtime requirement is Node.js `>= 22.18`. v2 allowed Node.js `>= 20`.

```bash
npm install hashery@3
```

`hookified` moved from v2 to v3. Its public API is unchanged, so existing `onHook` calls, the `warn` event, and `HasheryOptions` keep working. Browser usage is unchanged.

## v1 to v2

v2 upgraded `hookified` from v1 to v2. `HasheryOptions` extends `HookifiedOptions`, so those breaking changes apply here. Hook names (`before:toHash`, `after:toHash`, `before:toHashSync`, `after:toHashSync`), the `warn` event, and `onHook(event, handler)` stay the same.

### throwOnEmptyListeners

`throwOnEmptyListeners` now defaults to `true`. When a hook handler throws, Hookified emits `error`. With no `error` listener, that emit is rethrown.

```typescript
const hashery = new Hashery({ throwOnEmptyListeners: false });

const handled = new Hashery();
handled.on('error', (err) => {
  console.error('Hook error:', err);
});
```

### Renamed options

| v1 | v2 |
| --- | --- |
| `throwHookErrors` | `throwOnHookError` |
| `logger` | `eventLogger` |

### removeHook

`removeHook` takes the hook object returned by `onHook`, not `(event, handler)`.

```typescript
const hook = hashery.onHook('before:toHash', myHandler);
if (hook) {
  hashery.removeHook(hook);
}
```

`onHookEntry()` was removed. Use `onHook()`.

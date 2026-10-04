---
title: Hooks
order: 4
description: Intercept hashing with Hookified events, including sync hooks and invalid-algorithm warnings.
---

Hashery extends [Hookified](https://hookified.org). Hooks can read or change the input, the algorithm, and the resulting digest.

## Events

| Event | When it runs | Handlers |
| --- | --- | --- |
| `before:toHash` | Before an async hash | Async or sync |
| `after:toHash` | After an async hash | Async or sync |
| `before:toHashSync` | Before a sync hash | Sync only |
| `after:toHashSync` | After a sync hash | Sync only |

Async hook handlers are skipped for the sync events. `before` context fields are `data`, `algorithm`, and `maxLength`. `after` result fields are `hash`, `data`, and `algorithm`.

## Change the input or the result

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

hashery.onHook('before:toHash', async (context) => {
  context.data = { original: context.data, timestamp: new Date().toISOString() };
});

hashery.onHook('after:toHash', async (result) => {
  result.hash = result.hash.toUpperCase();
});

await hashery.toHash({ userId: 123 });
```

Several handlers on the same event run in registration order, and each sees the previous handler's changes.

Sync methods use the same shape, with synchronous handlers:

```typescript
hashery.onHook('before:toHashSync', (context) => {
  context.data = { wrapped: true, original: context.data };
});

hashery.onHook('after:toHashSync', (result) => {
  result.hash = result.hash.toUpperCase();
});
```

## Invalid algorithms

An unknown algorithm emits `warn` and falls back to `defaultAlgorithm` (`SHA-256`) or `defaultAlgorithmSync` (`djb2`).

```typescript
hashery.on('warn', (message: string) => {
  console.log(message);
});

await hashery.toHash({ data: 'test' }, { algorithm: 'invalid-algo' });
```

The message looks like: `Invalid algorithm 'invalid-algo' not found. Falling back to default algorithm 'SHA-256'.`

If the default sync algorithm is also missing, `toHashSync` throws.

## Remove a hook

`onHook` returns the stored hook. Pass that object to `removeHook`.

```typescript
const hook = hashery.onHook('before:toHash', async () => {});
if (hook) {
  hashery.removeHook(hook);
}
```

## Errors

`throwOnHookError` controls whether a handler error fails the hash. Hookified also emits an `error` event when a handler throws. `throwOnEmptyListeners` defaults to `true`, so that `error` event is rethrown when nothing is listening.

```typescript
const strict = new Hashery({ throwOnHookError: true });
const lenient = new Hashery({ throwOnEmptyListeners: false });

lenient.on('error', (err) => {
  console.error('Hook error:', err);
});
```

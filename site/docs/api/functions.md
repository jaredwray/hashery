---
title: Functions
order: 2
description: toHash, toHashSync, toNumber, toNumberSync, and loadProviders.
---

## toHash(data, options?)

Hashes `data` asynchronously. The value is passed through `stringify`, then through the selected provider.

| Option | Default | Description |
| --- | --- | --- |
| `algorithm` | `'SHA-256'` | Provider name. Unknown names fall back after a `warn` event. |
| `maxLength` | unset | Keep this many leading hex characters. |

Returns `Promise<string>`.

```typescript
const hash = await hashery.toHash({ name: 'John', age: 30 });
const shortHash = await hashery.toHash(
  { name: 'John' },
  { algorithm: 'SHA-256', maxLength: 16 },
);
```

## toHashSync(data, options?)

Same as `toHash`, but synchronous. Only djb2, fnv1, murmur, crc32, and custom providers that implement `toHashSync` are valid. A Web Crypto algorithm throws.

| Option | Default | Description |
| --- | --- | --- |
| `algorithm` | `'djb2'` | Sync provider name. |
| `maxLength` | unset | Keep this many leading hex characters. |

Returns `string`.

```typescript
const hash = hashery.toHashSync({ name: 'John' }, { algorithm: 'fnv1' });
```

## toNumber(data, options?)

Hashes `data`, then maps the digest onto an inclusive integer range.

| Option | Default | Description |
| --- | --- | --- |
| `min` | `0` | Inclusive lower bound. |
| `max` | `100` | Inclusive upper bound. |
| `algorithm` | `'SHA-256'` | Provider name. |
| `hashLength` | `16` | Hex characters used for the conversion. |

Returns `Promise<number>`. Throws when `min` is greater than `max`.

```typescript
const slot = await hashery.toNumber({ user: 'john' }, { min: 0, max: 9 });
```

## toNumberSync(data, options?)

Synchronous form of `toNumber`. The default algorithm is `'djb2'`. Web Crypto algorithms throw.

```typescript
const variant = hashery.toNumberSync({ userId: 'user123' }, { min: 0, max: 1 });
```

## loadProviders(providers?, options?)

Adds providers to the instance.

| Option | Default | Description |
| --- | --- | --- |
| `includeBase` | `true` | Keep the built-in providers. |

```typescript
hashery.loadProviders([customProvider]);
hashery.loadProviders([customProvider], { includeBase: false });
```

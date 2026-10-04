---
title: Usage
order: 2
description: Choose algorithms, truncate hashes, map hashes to numbers, and use Hashery in the browser.
---

Create one `Hashery` instance and reuse it. Caching is on by default, so repeated inputs skip the hash work.

## Algorithms

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

const hash384 = await hashery.toHash({ data: 'example' }, { algorithm: 'SHA-384' });
const hash512 = await hashery.toHash({ data: 'example' }, { algorithm: 'SHA-512' });
const fastHash = await hashery.toHash({ data: 'example' }, { algorithm: 'djb2' });
```

Algorithm names are case-insensitive and dash-tolerant. `SHA256`, `sha-256`, and `SHA-256` resolve to the same provider. An unknown name emits a `warn` event and falls back to the default algorithm instead of throwing.

## Default algorithm

```typescript
const hashery = new Hashery({ defaultAlgorithm: 'SHA-512' });

const hash1 = await hashery.toHash({ data: 'example' });
hashery.defaultAlgorithm = 'djb2';

const hashery2 = new Hashery({ defaultAlgorithmSync: 'fnv1' });
const syncHash = hashery2.toHashSync({ data: 'test' });
```

Async methods default to `SHA-256`. Sync methods default to `djb2`.

## Truncating output

`maxLength` keeps the leading characters of the hex digest.

```typescript
const shortHash = await hashery.toHash(
  { data: 'example' },
  { algorithm: 'SHA-256', maxLength: 16 },
);
```

Truncation is for display and short keys. It reduces collision resistance.

## Hash to a number

`toNumber` maps a hash onto an inclusive range. The same input always lands on the same number, which makes it useful for slots, A/B buckets, shards, and load-balancing.

```typescript
const slot = await hashery.toNumber({ userId: 123 }, { min: 0, max: 100 });

const variant = hashery.toNumberSync({ userId: 'user123' }, { min: 0, max: 1 });
const serverIndex = hashery.toNumberSync(
  { requestId: 'req_abc123' },
  { min: 0, max: 9, algorithm: 'fnv1' },
);
```

`min` defaults to `0` and `max` defaults to `100`. `hashLength` controls how many hex characters are used for the conversion and defaults to `16`. Passing `min` greater than `max` throws.

## Browser

The package exports a browser build. Load it from jsDelivr or bundle `hashery/browser` yourself.

```html
<script type="module">
  import { Hashery } from 'https://cdn.jsdelivr.net/npm/hashery@latest/dist/browser/index.js';

  const hashery = new Hashery();
  const hash = await hashery.toHash({ page: 'home', userId: 123 });
  const variant = await hashery.toNumber({ userId: 'user123' }, { min: 0, max: 1 });
</script>
```

## Custom serialization

`stringify` runs before hashing and `parse` deserializes stored values. Both default to `JSON`.

```typescript
const hashery = new Hashery({
  stringify: (data) => superjson.stringify(data),
  parse: (data) => superjson.parse(data),
});
```

Swap these when `JSON.stringify` drops values you need in the digest, such as `Date`, `Map`, or `undefined`.

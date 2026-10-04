---
title: Getting Started
order: 1
description: Install Hashery and hash objects in the browser or Node.js.
---

Hashery hashes objects, strings, arrays, and numbers with the same API in the browser and in Node.js. Async methods default to SHA-256 through the Web Crypto API. Sync methods default to djb2 so you can hash without `await`.

## Installation

```bash
npm install hashery
```

Hashery v3 requires Node.js `>= 22.18`. Browser usage needs a runtime with the Web Crypto API (Chrome 37+, Firefox 34+, Safari 11+, Edge 12+).

## Hash an object

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

const hash = await hashery.toHash({ name: 'John', age: 30 });
const stringHash = await hashery.toHash('hello world');
const numberHash = await hashery.toHash(42);
const arrayHash = await hashery.toHash([1, 2, 3, 4, 5]);
```

The same value always produces the same hash. Object key order does not matter because values are serialized with `JSON.stringify` before hashing.

## Synchronous hashing

`toHashSync` and `toNumberSync` work with djb2, fnv1, murmur, and crc32. They do not accept SHA-256, SHA-384, or SHA-512.

```typescript
const hashery = new Hashery();

const hash = hashery.toHashSync({ name: 'John', age: 30 });
const fnv1Hash = hashery.toHashSync({ data: 'example' }, { algorithm: 'fnv1' });
```

## Where to go next

- [Usage](/docs/usage/) covers algorithms, truncation, slot numbers, and the browser CDN build.
- [Algorithms](/docs/algorithms/web-crypto/) explains when to use Web Crypto versus djb2, FNV1, Murmur, or CRC32.
- [API](/docs/api/functions/) is the method and option reference.

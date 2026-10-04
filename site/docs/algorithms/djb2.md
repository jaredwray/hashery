---
title: DJB2
order: 2
description: Daniel J. Bernstein's fast non-cryptographic hash, and the default sync algorithm.
---

DJB2 is a 32-bit non-cryptographic hash by Daniel J. Bernstein. It is the default for `toHashSync` and `toNumberSync` because it is short and fast.

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

const hash = await hashery.toHash(
  { userId: 123, action: 'login' },
  { algorithm: 'djb2' },
);

const slot = hashery.toNumberSync(
  { userId: 'user123' },
  { min: 0, max: 99, algorithm: 'djb2' },
);
```

The digest is 8 hex characters.

## When to use it

Use DJB2 for hash tables, cache keys, checksums that do not face an attacker, and slot assignment. Do not use it for passwords, signatures, or integrity checks where someone can craft a collision.

## Algorithm

```
hash = 5381
for each character c:
    hash = ((hash << 5) + hash) + c
```

That is `hash * 33 + c`, starting from 5381.

```typescript
import { DJB2 } from 'hashery';

const djb2 = new DJB2();
const hash = djb2.toHashSync(new TextEncoder().encode('hello world'));
```

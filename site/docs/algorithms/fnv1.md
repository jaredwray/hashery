---
title: FNV1
order: 3
description: Fowler-Noll-Vo hash for hash tables, fingerprints, and non-crypto checksums.
---

FNV-1 (Fowler–Noll–Vo) is a non-cryptographic hash aimed at hash tables and checksums. It is public domain and has a strong avalanche for such a small function: a one-byte change moves the digest.

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

const hash = await hashery.toHash(
  { productId: 'ABC123', variant: 'red' },
  { algorithm: 'fnv1' },
);

const slot = hashery.toNumberSync(
  { sessionId: 'sess_xyz789' },
  { min: 0, max: 999, algorithm: 'fnv1' },
);
```

## When to use it

Use FNV1 for hash tables, fingerprints, deduplication, and bloom-filter keys. Do not use it for passwords, signatures, or integrity against an attacker. CRC32 is a better fit when the goal is detecting accidental bit flips.

## Algorithm

```
hash = FNV_offset_basis
for each byte b:
    hash = hash * FNV_prime
    hash = hash XOR b
```

```typescript
import { FNV1 } from 'hashery';

const fnv1 = new FNV1();
const hash = fnv1.toHashSync(new TextEncoder().encode('hello world'));
```

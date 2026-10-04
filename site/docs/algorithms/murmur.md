---
title: Murmur
order: 4
description: MurmurHash3 32-bit hashes with an optional seed.
---

Murmur is a 32-bit MurmurHash3 (x86) implementation. It is a non-cryptographic hash with good distribution for hash tables, bloom filters, and sharding. The constructor takes a seed, which defaults to `0`.

```typescript
import { Hashery, Murmur } from 'hashery';

const hashery = new Hashery();
const hash = hashery.toHashSync({ data: 'example' }, { algorithm: 'murmur' });

const seeded = new Murmur(42);
const data = new TextEncoder().encode('hello world');
seeded.toHashSync(data);
```

The digest is 8 lowercase hex characters. A different seed produces a different digest for the same bytes. Use a fixed seed when the hash must stay stable across processes.

## When to use it

Use Murmur when you want a fast 32-bit hash and a seed, for example to shard tenants or to vary a bloom filter. Do not use it for passwords or for detecting malicious changes. SHA-256 is the built-in choice for that.

`Hashery` registers one Murmur provider with the default seed. To hash with another seed, construct `Murmur` yourself or register a second provider under a different name.

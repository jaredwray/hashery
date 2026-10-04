---
title: Benchmarks
order: 8
description: How to compare Hashery algorithms, and what the current benchmark scripts measure.
---

The benchmark scripts live in `benchmark/`. They time simple hashing of random objects. Numbers move between machines, so run them locally before you pick an algorithm for a hot path.

```bash
pnpm benchmark
```

`pnpm benchmark:main` times each built-in algorithm through `toHash` and `toNumber`. `pnpm benchmark:vs-others` compares Hashery with `node:crypto` and the `object-hash` package.

## How to read the results

Sync djb2, fnv1, murmur, and crc32 are the fastest calls because they never touch Web Crypto or a promise. Async methods pay for that scheduling even when the algorithm itself is cheap.

With the default cache warmed, Hashery SHA-256 sits close to `node:crypto`. A cold Hashery call is slower than `node:crypto` because it stringifies the object and goes through the provider layer. `object-hash` is slower than both on the same fixture.

## Choosing an algorithm

| Need | Use |
| --- | --- |
| Security or integrity against tampering | SHA-256, SHA-384, or SHA-512 |
| Fast cache keys, slots, or hash tables | djb2, fnv1, or murmur |
| Accidental corruption checks | crc32 |
| A number in a range without `await` | `toNumberSync` with a non-crypto algorithm |

djb2, fnv1, murmur, and crc32 are not cryptographic. Do not use them for passwords, signatures, or any case where an attacker can choose the input.

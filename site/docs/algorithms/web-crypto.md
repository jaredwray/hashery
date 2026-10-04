---
title: Web Crypto
order: 1
description: SHA-256, SHA-384, and SHA-512 through the Web Crypto API.
---

SHA-256, SHA-384, and SHA-512 run through the Web Crypto API. They are async only and they are the algorithms to use when the hash must resist tampering.

| Name | Digest length | Role |
| --- | --- | --- |
| SHA-256 | 64 hex characters | Default for `toHash` and `toNumber` |
| SHA-384 | 96 hex characters | Longer digest |
| SHA-512 | 128 hex characters | Longest built-in digest |

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

const sha256 = await hashery.toHash({ data: 'example' });
const sha384 = await hashery.toHash({ data: 'example' }, { algorithm: 'SHA-384' });
const sha512 = await hashery.toHash({ data: 'example' }, { algorithm: 'SHA-512' });
```

Calling `toHashSync` or `toNumberSync` with a Web Crypto algorithm throws. Use djb2, fnv1, murmur, or crc32 for synchronous calls.

## Runtimes

The Web Crypto API is available in Chrome 37+, Firefox 34+, Safari 11+, and Edge 12+. Node.js has exposed it since 15. Hashery is tested on Node.js 22 and newer and uses `globalThis.crypto`.

## Direct provider

```typescript
import { WebCrypto } from 'hashery';

const sha256 = new WebCrypto({ algorithm: 'SHA-256' });
const data = new TextEncoder().encode('hello world');
await sha256.toHash(data);
```

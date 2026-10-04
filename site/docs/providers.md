---
title: Providers
order: 3
description: Call hash providers directly, manage a provider list, or add your own algorithm.
---

Every algorithm is a provider. `Hashery` registers the built-in providers for you. You can also construct them yourself or add a custom one.

## Use a provider directly

```typescript
import { DJB2, FNV1, Murmur, CRC, WebCrypto } from 'hashery';

const data = new TextEncoder().encode('hello world');

const djb2 = new DJB2();
djb2.toHashSync(data);

const murmur = new Murmur(42);
murmur.toHashSync(data);

const sha256 = new WebCrypto({ algorithm: 'SHA-256' });
await sha256.toHash(data);
```

`WebCrypto` is async only. `DJB2`, `FNV1`, `Murmur`, and `CRC` implement both `toHash` and `toHashSync`.

## Manage a collection

```typescript
import { HashProviders, DJB2, FNV1, Murmur } from 'hashery';

const providers = new HashProviders();
providers.add(new DJB2());
providers.add(new FNV1());
providers.add(new Murmur());

providers.get('DJB2');
providers.names;
```

`get` matches names without regard to case or dashes.

## Custom providers

A provider needs a `name` and a `toHash` function. Add `toHashSync` when the algorithm can run synchronously.

```typescript
import { Hashery, type HashProvider } from 'hashery';

const myProvider: HashProvider = {
  name: 'my-hash',
  async toHash(_data: BufferSource): Promise<string> {
    return 'custom-hash-value';
  },
  toHashSync(_data: BufferSource): string {
    return 'custom-hash-value';
  },
};

const hashery = new Hashery({ providers: [myProvider] });
await hashery.toHash({ data: 'test' }, { algorithm: 'my-hash' });
```

`loadProviders` adds providers later. Pass `{ includeBase: false }` to drop the built-in algorithms.

```typescript
hashery.loadProviders([myProvider], { includeBase: false });
```

`includeBase` defaults to `true`. The built-in names are `SHA-256`, `SHA-384`, `SHA-512`, `djb2`, `fnv1`, `murmur`, and `crc32`.

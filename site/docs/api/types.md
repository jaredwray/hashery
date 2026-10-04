---
title: Types
order: 3
description: HashAlgorithm, HashProvider, and the option types exported by Hashery.
---

## HashAlgorithm

```typescript
type HashAlgorithm =
  | 'SHA-256'
  | 'SHA-384'
  | 'SHA-512'
  | 'djb2'
  | 'fnv1'
  | 'murmur'
  | 'crc32';
```

Option fields accept `HashAlgorithm` and still allow a custom provider name (`HashAlgorithm | (string & {})`), so editors can autocomplete the built-in names.

```typescript
import { Hashery, type HashAlgorithm } from 'hashery';

const algorithm: HashAlgorithm = 'SHA-256';
const hashery = new Hashery({ defaultAlgorithm: algorithm });
```

## HashProvider

```typescript
type HashProvider = {
  name: string;
  toHash(data: BufferSource): Promise<string>;
  toHashSync?(data: BufferSource): string;
};
```

## HasheryOptions

Extends Hookified options with:

| Field | Description |
| --- | --- |
| `parse` | Deserialize function. Default `JSON.parse`. |
| `stringify` | Serialize function. Default `JSON.stringify`. |
| `providers` | Extra providers added at construction. |
| `includeBase` | Include the built-in providers. Default `true`. |
| `defaultAlgorithm` | Default async algorithm. Default `'SHA-256'`. |
| `defaultAlgorithmSync` | Default sync algorithm. Default `'djb2'`. |
| `cache` | `{ enabled?: boolean; maxSize?: number }`. |
| `throwOnHookError` | Fail the call when a hook handler throws. |
| `throwOnEmptyListeners` | Rethrow when an `error` event has no listener. Default `true`. |
| `eventLogger` | Logger used by Hookified. |

## HasheryToHashOptions

`algorithm` and `maxLength`. Shared by `toHash` and `toHashSync`.

## HasheryToNumberOptions

`algorithm`, `min`, `max`, and `hashLength`. Shared by `toNumber` and `toNumberSync`.

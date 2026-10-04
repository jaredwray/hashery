---
title: Caching
order: 5
description: Hashery's FIFO cache stores hash digests so identical inputs are not hashed again.
---

Identical data hashed with the same algorithm is served from an in-memory FIFO cache. Caching is enabled by default and holds 4000 entries.

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();
const hashery2 = new Hashery({ cache: { enabled: true, maxSize: 10000 } });

const hash1 = await hashery.toHash({ user: 'john' });
const hash2 = await hashery.toHash({ user: 'john' });

hashery.cache.size;
hashery.cache.clear();
hashery.cache.enabled = false;
```

When the cache is full, the oldest entry is evicted. Updating a key that is already stored replaces the value and does not change its place in the eviction order.

`cache.enabled` and `cache.maxSize` can be changed after construction. Disabling the cache stops new writes. `clear()` drops every entry.

The cache is per instance and is not shared across processes or browser tabs. It stores hex digests, not the original objects.

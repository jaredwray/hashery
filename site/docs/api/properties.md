---
title: Properties
order: 1
description: Hashery instance properties for serialization, providers, defaults, and the cache.
---

## parse

`ParseFn`. Default `JSON.parse`. Used to deserialize stored values.

```typescript
hashery.parse = customParseFunction;
```

## stringify

`StringifyFn`. Default `JSON.stringify`. Used to serialize a value before it is hashed.

```typescript
hashery.stringify = customStringifyFunction;
```

## providers

`HashProviders`. The collection of registered algorithms.

```typescript
hashery.providers.get('sha256');
```

## names

`string[]`. Names of the registered providers.

```typescript
hashery.names;
// ['SHA-256', 'SHA-384', 'SHA-512', 'djb2', 'fnv1', 'murmur', 'crc32']
```

## defaultAlgorithm

`string`. Default for `toHash` and `toNumber`. Starts as `'SHA-256'`.

```typescript
hashery.defaultAlgorithm = 'SHA-512';
```

## defaultAlgorithmSync

`string`. Default for `toHashSync` and `toNumberSync`. Starts as `'djb2'`.

```typescript
hashery.defaultAlgorithmSync = 'fnv1';
```

## cache

`Cache`. FIFO store of hex digests. See [Caching](/docs/caching/).

```typescript
hashery.cache.size;
hashery.cache.enabled = false;
hashery.cache.clear();
```

<img src="./site/logo.svg" />

# hashery
Browser Compatible Object Hashing

[![tests](https://github.com/jaredwray/hashery/actions/workflows/tests.yml/badge.svg)](https://github.com/jaredwray/hashery/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/jaredwray/hashery/graph/badge.svg?token=JTuDzWoTRn)](https://codecov.io/gh/jaredwray/hashery)
[![GitHub license](https://img.shields.io/github/license/jaredwray/hashery)](https://github.com/jaredwray/hashery/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/hashery)](https://npmjs.com/package/hashery)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/hashery/badge)](https://www.jsdelivr.com/package/npm/hashery)
[![npm](https://img.shields.io/npm/v/hashery)](https://npmjs.com/package/hashery)

# Features
- **Simple and Easy Object Hashing** - Object hashing based on multiple algorithms.
- **Browser and Node.js Compatible** - Built using `WebCrypto` API for both environments
- **Multiple Hash Algorithms** - Supports SHA-256, SHA-384, SHA-512 (WebCrypto), plus DJB2, FNV1, Murmer, and CRC32
- **Custom Serialization** - Easily replace JSON `parse` and `stringify` with custom functions
- **Deterministic Hashing** - Generate consistent hashes for the same input
- **Hash to Number** - Convert hashes to deterministic numbers within a specified range. Great for slot management
- **Provider System** - Extensible hash provider architecture for custom algorithms
- **Fuzzy Provider Matching** - Case-insensitive and dash-tolerant algorithm name matching
- **Hooks Support** - Extends Hookified for event-based functionality
- **Maintained on a Regular Basis** - Active maintenance and updates

# Installation

```bash
npm install hashery
```

or with pnpm:

```bash
pnpm add hashery
```

# Usage

## Basic Hashing

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

// Hash an object (defaults to SHA-256)
const hash = await hashery.toHash({ name: 'John', age: 30 });
console.log(hash); // SHA-256 hash string

// Hash a string
const stringHash = await hashery.toHash('hello world');

// Hash any value (numbers, arrays, etc.)
const numberHash = await hashery.toHash(42);
const arrayHash = await hashery.toHash([1, 2, 3, 4, 5]);
```

## Using Different Hash Algorithms

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

// Use SHA-384
const hash384 = await hashery.toHash({ data: 'example' }, 'SHA-384');

// Use SHA-512
const hash512 = await hashery.toHash({ data: 'example' }, 'SHA-512');

// Use non-crypto hash algorithms
const fastHash = await hashery.toHash({ data: 'example' }, 'djb2');
```

## Hash to Number (Great for Slot Management)

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

// Convert hash to a number within a range
const slot = await hashery.toNumber({ userId: 123 }, 0, 100);
console.log(slot); // Deterministic number between 0-100

// Use for consistent slot assignment
const userSlot = await hashery.toNumber({ userId: 'user@example.com' }, 0, 9);
// Same user will always get the same slot number
```

## Browser Usage

Hashery works seamlessly in the browser using the Web Crypto API. You can include it via CDN or bundle it with your application.

### Using via CDN (jsDelivr)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Hashery Browser Example</title>
</head>
<body>
  <script type="module">
    import { Hashery } from 'https://cdn.jsdelivr.net/npm/hashery@latest/dist/browser/index.js';

    const hashery = new Hashery();

    // Hash data in the browser
    const hash = await hashery.toHash({ page: 'home', userId: 123 });
    console.log('Hash:', hash);

    // Generate slot numbers for A/B testing
    const variant = await hashery.toNumber({ userId: 'user123' }, 0, 1);
    console.log('A/B Test Variant:', variant === 0 ? 'A' : 'B');
  </script>
</body>
</html>
```

# Hooks

Hashery extends [Hookified](https://github.com/jaredwray/hookified) to provide event-based functionality through hooks. Hooks allow you to intercept and modify behavior during the hashing process.

## Available Hooks

### `before:toHash`

Fired before hashing occurs. This hook receives a context object containing:
- `data` - The data to be hashed (can be modified)
- `algorithm` - The hash algorithm to use (can be modified)

### `after:toHash`

Fired after hashing completes. This hook receives a result object containing:
- `hash` - The generated hash (can be modified)
- `data` - The data that was hashed
- `algorithm` - The algorithm that was used

## Basic Hook Usage

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

// Listen to before:toHash hook
hashery.onHook('before:toHash', async (context) => {
  console.log('About to hash:', context.data);
  console.log('Using algorithm:', context.algorithm);
});

// Listen to after:toHash hook
hashery.onHook('after:toHash', async (result) => {
  console.log('Hash generated:', result.hash);
  console.log('Original data:', result.data);
});

await hashery.toHash({ name: 'John', age: 30 });
```

## Modifying Data with Hooks

You can modify the data before it's hashed:

```typescript
const hashery = new Hashery();

// Add a timestamp to all hashed data
hashery.onHook('before:toHash', async (context) => {
  context.data = {
    original: context.data,
    timestamp: new Date().toISOString()
  };
});

const hash = await hashery.toHash({ userId: 123 });
// Data will be hashed with timestamp included
```

## Modifying Algorithms with Hooks

You can force a specific algorithm regardless of what's requested:

```typescript
const hashery = new Hashery();

// Force all hashes to use SHA-512
hashery.onHook('before:toHash', async (context) => {
  context.algorithm = 'SHA-512';
});

// Even though we request SHA-256, it will use SHA-512
const hash = await hashery.toHash({ data: 'example' }, 'SHA-256');
console.log(hash.length); // 128 (SHA-512 hash length)
```

## Modifying Hash Results

You can transform the hash after it's generated:

```typescript
const hashery = new Hashery();

// Convert all hashes to uppercase
hashery.onHook('after:toHash', async (result) => {
  result.hash = result.hash.toUpperCase();
});

const hash = await hashery.toHash({ data: 'example' });
console.log(hash); // Hash will be in uppercase
```

## Implementing Caching with Hooks

Use hooks to implement a caching layer:

```typescript
const hashery = new Hashery();
const cache = new Map<string, string>();

// Store hashes in cache after generation
hashery.onHook('after:toHash', async (result) => {
  const cacheKey = `${result.algorithm}:${JSON.stringify(result.data)}`;
  cache.set(cacheKey, result.hash);
});

// Later you can check the cache before hashing
// (Note: You would need to implement cache lookup logic in your application)
```

## Logging and Debugging

Hooks are perfect for logging and debugging:

```typescript
const hashery = new Hashery();

hashery.onHook('before:toHash', async (context) => {
  console.log(`[DEBUG] Hashing data with ${context.algorithm}:`, context.data);
});

hashery.onHook('after:toHash', async (result) => {
  console.log(`[DEBUG] Hash generated: ${result.hash.substring(0, 8)}...`);
});

await hashery.toHash({ userId: 'user123' });
```

## Multiple Hooks

You can register multiple hooks, and they will execute in the order they were registered:

```typescript
const hashery = new Hashery();

hashery.onHook('before:toHash', async (context) => {
  console.log('First hook');
  context.data = { step: 1, original: context.data };
});

hashery.onHook('before:toHash', async (context) => {
  console.log('Second hook');
  context.data = { step: 2, previous: context.data };
});

await hashery.toHash({ name: 'test' });
// Output: "First hook" then "Second hook"
// Data will be wrapped twice
```

## Removing Hooks

You can remove hooks when they're no longer needed:

```typescript
const hashery = new Hashery();

const myHook = async (context: any) => {
  console.log('Hook called');
};

// Add the hook
hashery.onHook('before:toHash', myHook);

// Remove the hook
hashery.offHook('before:toHash', myHook);
```

## Error Handling in Hooks

Control how errors in hooks are handled using the `throwOnEmitError` option:

```typescript
// Throw errors that occur in hooks
const hashery1 = new Hashery({ throwOnEmitError: true });

hashery1.onHook('before:toHash', async (context) => {
  throw new Error('Hook error');
});

// This will throw the error
await hashery1.toHash({ data: 'example' }); // Throws Error: Hook error

// Silently handle errors in hooks
const hashery2 = new Hashery({ throwOnEmitError: false });

hashery2.onHook('before:toHash', async (context) => {
  throw new Error('Hook error');
});

// This will not throw, hashing continues
const hash = await hashery2.toHash({ data: 'example' }); // Returns hash successfully
```

# Web Crypto

Hashery is built on top of the Web Crypto API, which provides cryptographic operations in both browser and Node.js environments. This ensures consistent, secure hashing across all platforms.

## Browser Support

The Web Crypto API is supported in all modern browsers:
- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 12+

## Node.js Support

Node.js 15+ includes the Web Crypto API via the `crypto.webcrypto` global. Hashery automatically detects and uses the appropriate crypto implementation for your environment.

## Available Algorithms

### Web Crypto Algorithms (Async)
These algorithms use the Web Crypto API and return Promises:
- **SHA-256** - Secure Hash Algorithm 256-bit (default)
- **SHA-384** - Secure Hash Algorithm 384-bit
- **SHA-512** - Secure Hash Algorithm 512-bit

### Non-Crypto Algorithms (Async)
These algorithms are optimized for speed and are great for non-security use cases:
- **djb2** - Fast hash function by Daniel J. Bernstein
- **fnv1** - Fowler-Noll-Vo hash function
- **murmer** - MurmurHash algorithm
- **crc32** - Cyclic Redundancy Check 32-bit

All algorithms in Hashery use async/await for consistency, even though some non-crypto algorithms could be synchronous.

## Example: Using Web Crypto

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

// Web Crypto algorithms
const sha256 = await hashery.toHash({ data: 'example' }); // Default SHA-256
const sha384 = await hashery.toHash({ data: 'example' }, 'SHA-384');
const sha512 = await hashery.toHash({ data: 'example' }, 'SHA-512');

// Non-crypto algorithms (faster, but not cryptographically secure)
const djb2Hash = await hashery.toHash({ data: 'example' }, 'djb2');
const fnv1Hash = await hashery.toHash({ data: 'example' }, 'fnv1');
```

# DJB2 Hashing

DJB2 is a non-cryptographic hash function created by Daniel J. Bernstein. It's known for its simplicity and speed, making it ideal for hash tables, checksums, and other non-security applications.

## Why Use DJB2?

- **Fast Performance** - Significantly faster than cryptographic hash functions
- **Good Distribution** - Provides good hash distribution for most data
- **Simple Algorithm** - Easy to understand and implement
- **Low Collision Rate** - Works well for hash tables and data structures
- **Deterministic** - Same input always produces the same output

## When to Use DJB2

**Good for:**
- Hash tables and data structures
- Non-security checksums
- Fast data lookups
- Cache keys
- General-purpose hashing where security isn't a concern

**Not suitable for:**
- Password hashing
- Cryptographic signatures
- Security-sensitive applications
- Data integrity verification where tampering is a concern

## DJB2 vs Cryptographic Hashes

| Feature | DJB2 | SHA-256 |
|---------|------|---------|
| Speed | Very Fast | Slower |
| Security | Not Secure | Cryptographically Secure |
| Hash Length | 32-bit | 256-bit |
| Collision Resistance | Good | Excellent |
| Use Case | General Purpose | Security |

## Example: Using DJB2

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

// Hash with DJB2 (fast, non-cryptographic)
const djb2Hash = await hashery.toHash({ userId: 123, action: 'login' }, 'djb2');

// Use for cache keys
const cacheKey = await hashery.toHash({
  endpoint: '/api/users',
  params: { page: 1, limit: 10 }
}, 'djb2');

// Generate slot numbers with DJB2
const slot = await hashery.toNumber({ userId: 'user123' }, 0, 99, 'djb2');
```

## Algorithm Details

DJB2 uses a simple formula:
```
hash = 5381
for each character c:
    hash = ((hash << 5) + hash) + c
```

This translates to: `hash * 33 + c`, where 5381 is the magic initial value chosen by Daniel J. Bernstein for its distribution properties.

# FNV1 Hashing

FNV1 (Fowler-Noll-Vo) is a non-cryptographic hash function designed for fast hash table and checksum use. Created by Glenn Fowler, Landon Curt Noll, and Kiem-Phong Vo, it's known for its excellent distribution properties and simplicity.

## Why Use FNV1?

- **Excellent Distribution** - Superior hash distribution reduces collisions
- **Fast Performance** - Very fast computation with minimal operations
- **Simple Implementation** - Easy to understand and implement
- **Public Domain** - No licensing restrictions
- **Well-Tested** - Extensively used and tested in production systems
- **Deterministic** - Same input always produces the same output

## When to Use FNV1

**Good for:**
- Hash tables and associative arrays
- Checksums and fingerprints
- Data deduplication
- Bloom filters
- Fast lookups and indexing
- Non-cryptographic applications

**Not suitable for:**
- Password hashing
- Cryptographic signatures
- Security-critical applications
- Digital signatures
- Data integrity in adversarial environments

## FNV1 vs Other Hash Functions

| Feature | FNV1 | DJB2 | SHA-256 |
|---------|------|------|---------|
| Speed | Very Fast | Very Fast | Slower |
| Distribution | Excellent | Good | Excellent |
| Security | Not Secure | Not Secure | Cryptographically Secure |
| Collision Resistance | Good | Good | Excellent |
| Use Case | Hash Tables | General Purpose | Security |

## Example: Using FNV1

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

// Hash with FNV1 (fast, excellent distribution)
const fnv1Hash = await hashery.toHash({ productId: 'ABC123', variant: 'red' }, 'fnv1');

// Use for hash table keys
const tableKey = await hashery.toHash({
  userId: 'user@example.com',
  resource: 'profile'
}, 'fnv1');

// Generate distributed slot numbers with FNV1
const slot = await hashery.toNumber({ sessionId: 'sess_xyz789' }, 0, 999, 'fnv1');

// Use for data deduplication
const fingerprint = await hashery.toHash({
  content: 'document content here',
  metadata: { author: 'John', date: '2024-01-01' }
}, 'fnv1');
```

## Algorithm Details

FNV1 uses the following formula:
```
hash = FNV_offset_basis
for each byte b:
    hash = hash * FNV_prime
    hash = hash XOR b
```

Where:
- **FNV_offset_basis**: Initial hash value (different for 32-bit, 64-bit, etc.)
- **FNV_prime**: A carefully chosen prime number for good distribution
- **XOR**: Bitwise exclusive OR operation

The algorithm multiplies by a prime and XORs with each input byte, creating excellent avalanche properties where small input changes result in very different hash values.

# CRC Hashing

CRC (Cyclic Redundancy Check) is a non-cryptographic hash function designed primarily for detecting accidental changes to data. CRC32 is a 32-bit variant widely used in network protocols, file formats, and data integrity verification.

## Why Use CRC?

- **Error Detection** - Excellent at detecting accidental data corruption
- **Industry Standard** - Widely used in ZIP, PNG, Ethernet, and many other standards
- **Fast Performance** - Very efficient computation using lookup tables
- **Hardware Support** - Often implemented in hardware for maximum speed
- **Well-Understood** - Decades of use and mathematical analysis
- **Deterministic** - Same input always produces the same output

## When to Use CRC

**Good for:**
- Data integrity verification
- Error detection in network protocols
- File format checksums (ZIP, PNG, etc.)
- Storage integrity checks
- Detecting accidental corruption
- Quick data validation

**Not suitable for:**
- Cryptographic applications
- Password hashing
- Digital signatures
- Security-sensitive checksums
- Protection against intentional tampering
- Hash tables (not designed for this use case)

## CRC vs Other Hash Functions

| Feature | CRC32 | DJB2 | FNV1 | SHA-256 |
|---------|-------|------|------|---------|
| Primary Use | Error Detection | Hash Tables | Hash Tables | Security |
| Speed | Very Fast | Very Fast | Very Fast | Slower |
| Security | Not Secure | Not Secure | Not Secure | Cryptographically Secure |
| Hash Length | 32-bit | 32-bit | 32-bit/64-bit | 256-bit |
| Error Detection | Excellent | Poor | Poor | Excellent |
| Use Case | Data Integrity | General Purpose | Hash Tables | Security |

## Example: Using CRC

```typescript
import { Hashery } from 'hashery';

const hashery = new Hashery();

// Hash with CRC32 for data integrity
const crcHash = await hashery.toHash({ fileData: 'content here' }, 'crc32');

// Verify file integrity
const fileChecksum = await hashery.toHash({
  filename: 'document.pdf',
  size: 1024000,
  modified: '2024-01-01'
}, 'crc32');

// Network packet validation
const packetChecksum = await hashery.toHash({
  header: { type: 'data', seq: 123 },
  payload: 'packet payload data'
}, 'crc32');

// Quick data validation
const dataIntegrity = await hashery.toHash({
  recordId: 'rec_123',
  data: { field1: 'value1', field2: 'value2' }
}, 'crc32');
```

## Algorithm Details

CRC32 uses polynomial division in a finite field (GF(2)):

```
CRC32 polynomial: 0x04C11DB7 (IEEE 802.3 standard)

for each byte b:
    crc = (crc >> 8) XOR table[(crc XOR b) & 0xFF]
```

Key characteristics:
- **Polynomial**: Uses a standardized polynomial for consistent results
- **Lookup Table**: Pre-computed table for fast calculation
- **Bit Shifting**: Efficient XOR and shift operations
- **Finite Field**: Mathematical properties ensure good error detection

## Important Notes

⚠️ **Security Warning**: CRC is NOT cryptographically secure. It's designed to detect accidental errors, not intentional tampering. For security applications, use SHA-256 or other cryptographic hash functions.

✅ **Best Practice**: Use CRC32 for checksums and error detection in non-adversarial environments. Use cryptographic hashes (SHA-256, SHA-512) when security matters.

# API - Properties

## `parse`

Gets or sets the parse function used to deserialize stored values.

**Type:** `ParseFn`

**Default:** `JSON.parse`

```typescript
const hashery = new Hashery();
hashery.parse = customParseFunction;
```

## `stringify`

Gets or sets the stringify function used to serialize values for storage.

**Type:** `StringifyFn`

**Default:** `JSON.stringify`

```typescript
const hashery = new Hashery();
hashery.stringify = customStringifyFunction;
```

## `providers`

Gets or sets the HashProviders instance used to manage hash providers.

**Type:** `HashProviders`

```typescript
const hashery = new Hashery();
console.log(hashery.providers);
```

## `names`

Gets the names of all registered hash algorithm providers.

**Type:** `Array<string>`

**Returns:** An array of provider names (e.g., ['SHA-256', 'SHA-384', 'SHA-512', 'djb2', 'fnv1', 'murmer', 'crc32'])

```typescript
const hashery = new Hashery();
console.log(hashery.names); // ['SHA-256', 'SHA-384', 'SHA-512', 'djb2', 'fnv1', 'murmer', 'crc32']
```

# API - Functions

## `toHash(data, algorithm?)`

Generates a cryptographic hash of the provided data using the specified algorithm. The data is first stringified using the configured stringify function, then hashed.

**Parameters:**
- `data` (unknown) - The data to hash (will be stringified before hashing)
- `algorithm` (string, optional) - The hash algorithm to use (defaults to 'SHA-256')

**Returns:** `Promise<string>` - A Promise that resolves to the hexadecimal string representation of the hash

**Example:**

```typescript
const hashery = new Hashery();

// Using default SHA-256
const hash = await hashery.toHash({ name: 'John', age: 30 });

// Using a different algorithm
const hash512 = await hashery.toHash({ name: 'John' }, 'SHA-512');
const fastHash = await hashery.toHash({ name: 'John' }, 'djb2');
```

## `toNumber(data, min, max, algorithm?)`

Generates a deterministic number within a specified range based on the hash of the provided data. This method uses the toHash function to create a consistent hash, then maps it to a number between min and max (inclusive).

**Parameters:**
- `data` (unknown) - The data to hash (will be stringified before hashing)
- `min` (number) - The minimum value of the range (inclusive)
- `max` (number) - The maximum value of the range (inclusive)
- `algorithm` (string, optional) - The hash algorithm to use (defaults to 'SHA-256')

**Returns:** `Promise<number>` - A Promise that resolves to a number between min and max (inclusive)

**Throws:** Error if min is greater than max

**Example:**

```typescript
const hashery = new Hashery();

// Generate a number between 0 and 100
const num = await hashery.toNumber({ user: 'john' }, 0, 100);

// Using a different algorithm
const num512 = await hashery.toNumber({ user: 'john' }, 0, 255, 'SHA-512');
```

## `loadProviders(providers?, options?)`

Loads hash providers into the Hashery instance. This allows you to add custom hash providers or replace the default ones.

**Parameters:**
- `providers` (Array<HashProvider>, optional) - Array of hash providers to add
- `options` (HasheryLoadProviderOptions, optional) - Options object
  - `includeBase` (boolean) - Whether to include base providers (default: true)

**Returns:** `void`

**Example:**

```typescript
const hashery = new Hashery();

// Add a custom provider
const customProvider = {
  name: 'custom',
  toHash: async (data: BufferSource) => 'custom-hash'
};

hashery.loadProviders([customProvider]);

// Load without base providers
hashery.loadProviders([customProvider], { includeBase: false });
```

# Benchmarks

Overall view of the current algorithm's and their performance using simple hashing with random data. Many of these are not secure and should be used only for object hashing. Read about each one in the documentation and pick what works best for your use case.

|   name    |  summary  |  ops/sec  |  time/op  |  margin  |  samples  |
|-----------|:---------:|----------:|----------:|:--------:|----------:|
|  DJB2     |    🥇     |     522K  |      2µs  |  ±0.86%  |     506K  |
|  MURMER   |  -0.24%   |     521K  |      2µs  |  ±0.96%  |     504K  |
|  FNV1     |   -3.9%   |     501K  |      2µs  |  ±0.27%  |     487K  |
|  CRC32    |   -12%    |     457K  |      2µs  |  ±0.22%  |     446K  |
|  SHA-256  |   -81%    |      98K  |     10µs  |  ±0.20%  |      96K  |
|  SHA-384  |   -83%    |      90K  |     12µs  |  ±2.88%  |      85K  |
|  SHA-512  |   -83%    |      86K  |     12µs  |  ±0.58%  |      84K  |

# Code of Conduct and Contributing
Please use our [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing](CONTRIBUTING.md) guidelines for development and testing. We appreciate your contributions!

# License

[MIT](LICENSE) & © [Jared Wray](https://jaredwray.com)
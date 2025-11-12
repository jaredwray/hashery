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

# Code of Conduct and Contributing
Please use our [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing](CONTRIBUTING.md) guidelines for development and testing. We appreciate your contributions!

# License

[MIT](LICENSE) & © [Jared Wray](https://jaredwray.com)
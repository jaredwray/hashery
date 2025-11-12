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
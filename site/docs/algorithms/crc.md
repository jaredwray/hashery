---
title: CRC32
order: 5
description: CRC32 checksums for accidental corruption, not for security.
---

CRC32 is a 32-bit cyclic redundancy check. It is the usual checksum in ZIP, PNG, and Ethernet. It is very good at catching accidental changes and it is not a security hash.

```typescript
import { Hashery, CRC } from 'hashery';

const hashery = new Hashery();

const checksum = await hashery.toHash(
  { fileData: 'content here' },
  { algorithm: 'crc32' },
);

const crc = new CRC();
crc.toHashSync(new TextEncoder().encode('hello world'));
```

## When to use it

Use CRC32 to detect accidental corruption in files, records, and packets. Do not use it against an attacker who can change the data and the checksum together. Do not use it as a hash-table function; DJB2, FNV1, and Murmur are built for that.

The implementation follows the IEEE 802.3 polynomial (`0x04C11DB7`) with a lookup table:

```
for each byte b:
    crc = (crc >> 8) XOR table[(crc XOR b) & 0xFF]
```

> [!WARNING]
> CRC32 detects accidents. It does not stop intentional tampering. Use SHA-256 or SHA-512 when the hash protects integrity.

# Release notes

## Unreleased

`toNumber()` and `toNumberSync()` now use all selected hash digits to calculate a slot. A user can move to a different experiment group or shard after an upgrade.

Check stored assignments before you switch versions. See [Migration for numeric assignments](README.md#migration-for-numeric-assignments).

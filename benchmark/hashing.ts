import { tinybenchPrinter } from "@monstermann/tinybench-pretty-printer";
import { Bench } from "tinybench";
import { faker } from "@faker-js/faker";
import { Hashery } from "../src/index.js";

const bench = new Bench({ name: "Hashing", iterations: 10_000 });
const hashery = new Hashery();


bench.add(`SHA-256 Async`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime });
});
bench.add(`SHA-384 Async`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, { algorithm: 'SHA-384' });
});
bench.add(`SHA-512 Async`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, { algorithm: 'SHA-512' });
});
bench.add(`CRC32 Async`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, { algorithm: 'CRC32' });
});
bench.add(`CRC32 Sync`, async () => {
	const hash = hashery.toHashSync({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, { algorithm: 'CRC32' });
});
bench.add(`DJB2 Async`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, { algorithm: 'DJB2' });
});
bench.add(`DJB2 Sync`, async () => {
	const hash = hashery.toHashSync({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, { algorithm: 'DJB2' });
});
bench.add(`FNV1 Async`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, { algorithm: 'FNV1' });
});
bench.add(`FNV1 Sync`, async () => {
	const hash = hashery.toHashSync({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, { algorithm: 'FNV1' });
});
bench.add(`MURMER Async`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, { algorithm: 'MURMER' });
});
bench.add(`MURMER Sync`, async () => {
	const hash = hashery.toHashSync({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, { algorithm: 'MURMER' });
});

await bench.run();

const cli = tinybenchPrinter.toMarkdown(bench);
console.log(cli);
console.log("");

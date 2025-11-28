import { tinybenchPrinter } from "@monstermann/tinybench-pretty-printer";
import { Bench } from "tinybench";
import { faker } from "@faker-js/faker";
import { Hashery } from "../src/index.js";

const bench = new Bench({ name: "Hashing without Caching", iterations: 10_000 });
const hashery = new Hashery({ cache: { enabled: false } });

// Create an array of fake objects before running the benchmark
const fakeObjects = Array.from({ length: 4000 }, () => ({
	id: faker.string.alphanumeric(10),
	date: faker.date.anytime(),
}));

// Helper function to get a random object from the array
const getRandomObject = () => fakeObjects[Math.floor(Math.random() * fakeObjects.length)];

bench.add(`SHA-256 Async`, async () => {
	const hash = await hashery.toHash(getRandomObject());
});
bench.add(`SHA-384 Async`, async () => {
	const hash = await hashery.toHash(getRandomObject(), { algorithm: 'SHA-384' });
});
bench.add(`SHA-512 Async`, async () => {
	const hash = await hashery.toHash(getRandomObject(), { algorithm: 'SHA-512' });
});
bench.add(`CRC32 Async`, async () => {
	const hash = await hashery.toHash(getRandomObject(), { algorithm: 'CRC32' });
});
bench.add(`CRC32 Sync`, async () => {
	const hash = hashery.toHashSync(getRandomObject(), { algorithm: 'CRC32' });
});
bench.add(`DJB2 Async`, async () => {
	const hash = await hashery.toHash(getRandomObject(), { algorithm: 'DJB2' });
});
bench.add(`DJB2 Sync`, async () => {
	const hash = hashery.toHashSync(getRandomObject(), { algorithm: 'DJB2' });
});
bench.add(`FNV1 Async`, async () => {
	const hash = await hashery.toHash(getRandomObject(), { algorithm: 'FNV1' });
});
bench.add(`FNV1 Sync`, async () => {
	const hash = hashery.toHashSync(getRandomObject(), { algorithm: 'FNV1' });
});
bench.add(`MURMER Async`, async () => {
	const hash = await hashery.toHash(getRandomObject(), { algorithm: 'MURMER' });
});
bench.add(`MURMER Sync`, async () => {
	const hash = hashery.toHashSync(getRandomObject(), { algorithm: 'MURMER' });
});

await bench.run();

console.log(`## ${bench.name}`);
const cli = tinybenchPrinter.toMarkdown(bench);
console.log(cli);
console.log("");

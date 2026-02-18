import { tinybenchPrinter } from "@monstermann/tinybench-pretty-printer";
import { Bench } from "tinybench";
import { faker } from "@faker-js/faker";
import { Hashery } from "../src/index.js";

const bench = new Bench({ name: "toNumber without Caching", iterations: 10_000 });
const hashery = new Hashery({ cache: { enabled: false } });

// Create an array of fake objects before running the benchmark
const fakeObjects = Array.from({ length: 4000 }, () => ({
	id: faker.string.alphanumeric(10),
	date: faker.date.anytime(),
}));

// Helper function to get a random object from the array
const getRandomObject = () => fakeObjects[Math.floor(Math.random() * fakeObjects.length)];

bench.add(`SHA-256 Async`, async () => {
	const num = await hashery.toNumber(getRandomObject());
});
bench.add(`SHA-384 Async`, async () => {
	const num = await hashery.toNumber(getRandomObject(), { algorithm: 'SHA-384' });
});
bench.add(`SHA-512 Async`, async () => {
	const num = await hashery.toNumber(getRandomObject(), { algorithm: 'SHA-512' });
});
bench.add(`CRC32 Async`, async () => {
	const num = await hashery.toNumber(getRandomObject(), { algorithm: 'CRC32' });
});
bench.add(`CRC32 Sync`, async () => {
	const num = hashery.toNumberSync(getRandomObject(), { algorithm: 'CRC32' });
});
bench.add(`DJB2 Async`, async () => {
	const num = await hashery.toNumber(getRandomObject(), { algorithm: 'DJB2' });
});
bench.add(`DJB2 Sync`, async () => {
	const num = hashery.toNumberSync(getRandomObject(), { algorithm: 'DJB2' });
});
bench.add(`FNV1 Async`, async () => {
	const num = await hashery.toNumber(getRandomObject(), { algorithm: 'FNV1' });
});
bench.add(`FNV1 Sync`, async () => {
	const num = hashery.toNumberSync(getRandomObject(), { algorithm: 'FNV1' });
});
bench.add(`MURMUR Async`, async () => {
	const num = await hashery.toNumber(getRandomObject(), { algorithm: 'MURMUR' });
});
bench.add(`MURMUR Sync`, async () => {
	const num = hashery.toNumberSync(getRandomObject(), { algorithm: 'MURMUR' });
});

await bench.run();

console.log(`## ${bench.name}`);
const cli = tinybenchPrinter.toMarkdown(bench);
console.log(cli);
console.log("");

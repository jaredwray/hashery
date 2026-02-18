import { createHash } from "node:crypto";
import { tinybenchPrinter } from "@monstermann/tinybench-pretty-printer";
import { Bench } from "tinybench";
import { faker } from "@faker-js/faker";
import objectHash from "object-hash";
import { Hashery } from "../src/index.js";

// Helper function to hash objects using node:crypto
const nodeHash = (data: unknown, algorithm: string): string => {
	const serialized = JSON.stringify(data);
	return createHash(algorithm).update(serialized).digest("hex");
};

const bench = new Bench({ name: "Hashery vs Others", iterations: 10_000 });
const hashery = new Hashery({ cache: { enabled: false } });
const hasheryCached = new Hashery();

// Create an array of fake objects before running the benchmark
const fakeObjects = Array.from({ length: 4000 }, () => ({
	id: faker.string.alphanumeric(10),
	date: faker.date.anytime(),
}));

// Helper function to get a random object from the array
const getRandomObject = () => fakeObjects[Math.floor(Math.random() * fakeObjects.length)];

// SHA-256 comparison
bench.add(`Hashery SHA-256`, async () => {
	await hashery.toHash(getRandomObject());
});
bench.add(`Hashery SHA-256 (Cache)`, async () => {
	await hasheryCached.toHash(getRandomObject());
});
bench.add(`node:crypto SHA-256`, () => {
	nodeHash(getRandomObject(), "sha256");
});

// SHA-384 comparison
bench.add(`Hashery SHA-384`, async () => {
	await hashery.toHash(getRandomObject(), { algorithm: 'SHA-384' });
});
bench.add(`Hashery SHA-384 (Cache)`, async () => {
	await hasheryCached.toHash(getRandomObject(), { algorithm: 'SHA-384' });
});
bench.add(`node:crypto SHA-384`, () => {
	nodeHash(getRandomObject(), "sha384");
});

// SHA-512 comparison
bench.add(`Hashery SHA-512`, async () => {
	await hashery.toHash(getRandomObject(), { algorithm: 'SHA-512' });
});
bench.add(`Hashery SHA-512 (Cache)`, async () => {
	await hasheryCached.toHash(getRandomObject(), { algorithm: 'SHA-512' });
});
bench.add(`node:crypto SHA-512`, () => {
	nodeHash(getRandomObject(), "sha512");
});

// object-hash comparison
bench.add(`object-hash SHA1`, () => {
	objectHash(getRandomObject());
});
bench.add(`object-hash SHA256`, () => {
	objectHash(getRandomObject(), { algorithm: "sha256" });
});

await bench.run();

console.log(`## ${bench.name}`);
const cli = tinybenchPrinter.toMarkdown(bench);
console.log(cli);
console.log("");

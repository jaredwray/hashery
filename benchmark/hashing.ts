import { tinybenchPrinter } from "@monstermann/tinybench-pretty-printer";
import { Bench } from "tinybench";
import { faker } from "@faker-js/faker";
import { Hashery } from "../src/index.js";

const bench = new Bench({ name: "Hashing", iterations: 10_000 });
const hashery = new Hashery();


bench.add(`SHA-256`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime });
});
bench.add(`SHA-384`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, 'SHA-384');
});
bench.add(`SHA-512`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, 'SHA-512');
});
bench.add(`CRC32`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, 'CRC32');
});
bench.add(`DJB2`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, 'DJB2');
});
bench.add(`FNV1`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, 'FNV1');
});
bench.add(`MURMER`, async () => {
	const hash = await hashery.toHash({ id: faker.string.alphanumeric(10), date: faker.date.anytime }, 'MURMER');
});

await bench.run();

const cli = tinybenchPrinter.toMarkdown(bench);
console.log(cli);
console.log("");

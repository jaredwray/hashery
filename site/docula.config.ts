import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import type { DoculaConsole, DoculaOptions } from "docula";

dotenv.config({ quiet: true });

export const options: Partial<DoculaOptions> = {
	template: "modern",
	githubPath: "jaredwray/hashery",
	output: "./site/dist",
	sitePath: "./site",
	siteTitle: "Hashery",
	siteDescription: "Browser / Node.js Compatible Object Hashing",
	siteUrl: "https://hashery.dev",
	autoReadme: false,
	themeMode: "light",
	...(process.env.OPENAI_API_KEY && {
		ai: {
			provider: "openai",
			apiKey: process.env.OPENAI_API_KEY,
		},
	}),
};

export const onPrepare = async (
	config: DoculaOptions,
	doculaConsole?: DoculaConsole,
): Promise<void> => {
	const readmePath = path.join(process.cwd(), "./README.md");
	const readmeSitePath = path.join(config.sitePath, "README.md");
	const readme = await fs.promises.readFile(readmePath, "utf8");
	const updatedReadme = readme.replace(
		/<div align="center"><img src="\.\/site\/logo\.svg"[^>]*><\/div>\s*/,
		"",
	);
	const message = `writing updated readme to ${readmeSitePath}`;
	if (doculaConsole) {
		doculaConsole.info(message);
	} else {
		console.info(message);
	}

	await fs.promises.writeFile(readmeSitePath, updatedReadme);
};

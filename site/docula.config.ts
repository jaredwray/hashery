import process from "node:process";
import dotenv from "dotenv";
import type { DoculaOptions } from "docula";

dotenv.config({ quiet: true });

export const options: Partial<DoculaOptions> = {
	template: "modern",
	githubPath: "jaredwray/hashery",
	output: "./site/dist",
	sitePath: "./site",
	siteTitle: "Hashery",
	siteDescription: "Browser / Node.js Compatible Object Hashing",
	siteUrl: "https://hashery.org",
	themeMode: "light",
	...(process.env.OPENAI_API_KEY && {
		ai: {
			provider: "openai",
			apiKey: process.env.OPENAI_API_KEY,
		},
	}),
};

import { Moment } from "moment";
import { TFile, Vault } from "obsidian";

import { stopFileTimekeeps } from "./stopFileTimekeeps";

/**
 * Stop all timekeeps across all markdown files in the provided vault
 *
 * @param vault The vault to stop files within
 * @param currentTime The current time to use as the stopped time
 * @returns The total number of stopped timekeeps
 */
export async function stopAllTimekeeps(vault: Vault, currentTime: Moment) {
	const markdownFiles = vault.getMarkdownFiles();
	const batchSize = 10;

	const processFile = (file: TFile) =>
		stopFileTimekeeps(vault, file, currentTime);

	let totalStopped = 0;

	for (let i = 0; i < markdownFiles.length; i += batchSize) {
		const batch = markdownFiles.slice(i, i + batchSize);
		const results = await Promise.allSettled(batch.map(processFile));

		for (const result of results) {
			if (result.status === "rejected") {
				throw result.reason;
			}

			totalStopped += result.value;
		}
	}

	return totalStopped;
}

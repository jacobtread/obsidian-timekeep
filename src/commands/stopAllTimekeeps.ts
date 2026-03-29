import type { App, Command, TFile, Vault } from "obsidian";

import moment, { Moment } from "moment";
import { Notice } from "obsidian";

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

	const processFile = (file: TFile) => stopFileTimekeeps(vault, file, currentTime);

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

export default function (app: App): Command {
	return {
		id: `stop-all-timekeeps`,
		name: `Stop All Running Trackers`,
		callback: () => {
			const currentTime = moment();
			stopAllTimekeeps(app.vault, currentTime)
				.then((totalStopped) => {
					if (totalStopped < 1) {
						new Notice("Nothing to stop.", 1500);
						return;
					}

					new Notice(
						`Stopped ${totalStopped} tracker${totalStopped !== 1 ? "s" : ""}`,
						1500
					);
				})
				.catch((error) => {
					let errorMessage = "";
					if (error instanceof Error) {
						errorMessage = error.message;
					} else if (typeof error === "string") {
						errorMessage = error;
					} else {
						error = "Unknown error occurred";
					}

					new Notice("Failed to stop timekeeps: " + errorMessage, 1500);
				});
		},
	};
}

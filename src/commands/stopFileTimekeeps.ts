import type { Moment } from "moment";

import moment from "moment";
import { Notice, type App, type Command, type TFile, type Vault } from "obsidian";

import type { Timekeep } from "@/timekeep/schema";

import { getRunningEntry, stopRunningEntries } from "@/timekeep";
import { replaceTimekeepCodeblock, extractTimekeepCodeblocksWithPosition } from "@/timekeep/parser";

/**
 * Stops all timekeeps in the provided file if there are any running.
 *
 * Does not perform a file write if no running timekeeps are detected
 * when using a cached read
 *
 * @param vault The vault the file is within
 * @param file The file to stop timekeeps within
 * @param currentTime The current time to use as the stopped time
 * @returns The total number of stopped timekeeps
 */
export async function stopFileTimekeeps(vault: Vault, file: TFile, currentTime: Moment) {
	const content = await vault.cachedRead(file);
	const initialTimekeeps = extractTimekeepCodeblocksWithPosition(content);

	// Collect the indexes of running timekeeps
	const runningIndexes = initialTimekeeps.reduce<number[]>((runningIndexes, timekeep, index) => {
		const entry = getRunningEntry(timekeep.timekeep.entries);

		if (entry !== null) {
			runningIndexes.push(index);
		}

		return runningIndexes;
	}, []);

	// Nothing to process
	if (runningIndexes.length < 1) {
		return 0;
	}

	await vault.process(file, (content) => {
		for (const index of runningIndexes) {
			// Timekeep's must be relocated for every processing step as the positions
			// of timekeeps can change when a previous one is stopped
			const timekeeps = extractTimekeepCodeblocksWithPosition(content);

			if (timekeeps.length < index + 1) {
				throw new Error(
					`timekeep file was missing index ${index} in ${file.path} ${file.name}`
				);
			}

			const { timekeep, startLine, endLine } = timekeeps[index];

			const stoppedTimekeep: Timekeep = {
				...timekeep,
				entries: stopRunningEntries(timekeep.entries, currentTime),
			};

			content = replaceTimekeepCodeblock(stoppedTimekeep, content, startLine, endLine);
		}

		return content;
	});

	return runningIndexes.length;
}

export default function (app: App): Command {
	return {
		id: `stop-current-timekeeps`,
		name: `Stop All Running Trackers (Current File Only)`,
		callback: () => {
			const currentTime = moment();
			const currentFile = app.workspace.activeEditor?.file ?? null;

			if (currentFile === null) {
				new Notice("No active file detected", 1500);
				return;
			}

			stopFileTimekeeps(app.vault, currentFile, currentTime)
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

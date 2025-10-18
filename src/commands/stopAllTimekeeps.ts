import { Moment } from "moment";
import { TFile, Vault } from "obsidian";
import { Timekeep } from "@/timekeep/schema";
import { getRunningEntry, stopRunningEntries } from "@/timekeep";
import {
	replaceTimekeepCodeblock,
	extractTimekeepCodeblocksWithPosition,
} from "@/timekeep/parser";

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
export async function stopFileTimekeeps(
	vault: Vault,
	file: TFile,
	currentTime: Moment
) {
	const content = await vault.cachedRead(file);
	const initialTimekeeps = extractTimekeepCodeblocksWithPosition(content);

	// Collect the indexes of running timekeeps
	const runningIndexes = initialTimekeeps.reduce<number[]>(
		(runningIndexes, timekeep, index) => {
			const entry = getRunningEntry(timekeep.timekeep.entries);

			if (entry !== null) {
				runningIndexes.push(index);
			}

			return runningIndexes;
		},
		[]
	);

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

			content = replaceTimekeepCodeblock(
				stoppedTimekeep,
				content,
				startLine,
				endLine
			);
		}

		return content;
	});

	return runningIndexes.length;
}

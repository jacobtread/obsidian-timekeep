import { isEmptyString } from "@/utils";
import {
	TIMEKEEP,
	Timekeep,
	stripTimekeepRuntimeData,
} from "@/timekeep/schema";

export type LoadResult = LoadSuccess | LoadError;

export type LoadSuccess = { success: true; timekeep: Timekeep };
export type LoadError = { success: false; error: string };

/**
 * Attempts to load a {@see Timekeep} from the provided
 * JSON string
 *
 * @param value The JSON string to load from
 * @return The load result
 */
export function load(value: string): LoadResult {
	// Empty string should create an empty timekeep
	if (isEmptyString(value)) {
		return { success: true, timekeep: { entries: [] } };
	}

	// Load the JSON value
	let parsedValue: unknown;
	try {
		parsedValue = JSON.parse(value);
	} catch (e) {
		return {
			success: false,
			error: "Failed to parse timekeep JSON",
		};
	}

	// Parse the data against the schema
	const timekeepResult = TIMEKEEP.safeParse(parsedValue);
	if (!timekeepResult.success) {
		return {
			success: false,
			error: timekeepResult.error.toString(),
		};
	}

	const timekeep = timekeepResult.data;
	return { success: true, timekeep };
}

export interface TimekeepWithPosition {
	timekeep: Timekeep;
	startLine: number;
	endLine: number;
}

/**
 * Extracts timekeep codeblocks from the provided file contents.
 *
 * Provides the extracted timekeep blocks along with the start
 * and end lines that they span
 *
 * @param value The file text contents
 * @returns The extracted timekeep blocks
 */
export function extractTimekeepCodeblocksWithPosition(
	value: string
): TimekeepWithPosition[] {
	const out: TimekeepWithPosition[] = [];
	const lines = value.replace("\n\r", "\n").split("\n");

	for (let i = 0; i < lines.length; i++) {
		const startLine = lines[i];

		// Skip lines till a timekeep block is found
		if (!startLine.trim().startsWith("```timekeep")) {
			continue;
		}

		// Find end of codeblock
		const endLineIndex = lines.findIndex(
			(line, index) => index > i && line.trim() === "```"
		);

		if (endLineIndex === -1) {
			continue;
		}

		let content = "";
		for (let lineIndex = i + 1; lineIndex < endLineIndex; lineIndex++) {
			content += lines[lineIndex] + "\n";
		}

		const result = load(content);
		if (result.success) {
			out.push({
				timekeep: result.timekeep,
				startLine: i,
				endLine: endLineIndex,
			});
		}
	}

	return out;
}

/**
 * Extracts timekeep codeblocks from the provided file
 * contents.
 *
 * @param value The file text contents
 * @returns The extracted timekeep blocks
 */
export function extractTimekeepCodeblocks(value: string): Timekeep[] {
	return (
		extractTimekeepCodeblocksWithPosition(value)
			//
			.map((value) => value.timekeep)
	);
}

/**
 * Replaces the contents of a specific timekeep codeblock within
 * a file returning the modified contents to be saved
 */
export function replaceTimekeepCodeblock(
	timekeep: Timekeep,
	content: string,
	lineStart: number,
	lineEnd: number
): string {
	const timekeepJSON = JSON.stringify(stripTimekeepRuntimeData(timekeep));

	// The actual JSON is the line after the code block start
	const contentStart = lineStart + 1;
	const contentLength = lineEnd - contentStart;

	// Split the content into lines
	const lines = content.split("\n");

	// Sanity checks to prevent overriding content
	if (!lines[lineStart].trim().startsWith("```")) {
		throw new Error(
			"Content timekeep out of sync, line number for codeblock start doesn't match: " +
				content[lineStart]
		);
	}

	if (!lines[lineEnd].trim().startsWith("```")) {
		throw new Error(
			"Content timekeep out of sync, line number for codeblock end doesn't match" +
				content[lineEnd]
		);
	}

	// Splice the new JSON content in between the codeblock, removing the old codeblock lines
	lines.splice(contentStart, contentLength, timekeepJSON);

	return lines.join("\n");
}

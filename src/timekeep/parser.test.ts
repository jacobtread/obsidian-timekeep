import moment from "moment";

import { Timekeep, stripTimekeepRuntimeData } from "./schema";
import {
	load,
	LoadError,
	LoadSuccess,
	replaceTimekeepCodeblock,
} from "./parser";

/**
 * Generates a code block surrounding the provided JSON
 * with the provided leading and trailing number of lines
 *
 * @param json The JSON to put between the codeblocks
 * @param linesBefore Number of lines before the codeblock
 * @param linesAfter Number of lines after the codeblock
 * @returns The generated codeblock
 */
const createCodeBlock = (
	json: string,
	linesBefore: number,
	linesAfter: number
) => {
	let output = "";
	for (let i = 0; i < linesBefore; i++) {
		output += "\n";
	}
	output += "```timekeep\n";
	output += json;
	output += "\n```";
	for (let i = 0; i < linesAfter; i++) {
		output += "\n";
	}
	return output;
};

describe("replacing content", () => {
	it("should replace codeblock contents", () => {
		const lineStart = 4; // Line the codeblock should start on
		const lineEnd = lineStart + 2; // Line the codeblock should end on

		// Input data to replace
		const input = createCodeBlock(
			`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
			4,
			4
		);

		// Timekeep with a renamed block
		const inputTimekeep: Timekeep = {
			entries: [
				{
					id: "49b99108-b1ad-4355-baa9-89c49c342be2",
					name: "Block 2",
					startTime: moment("2024-03-17T01:33:51.630Z"),
					endTime: moment("2024-03-17T01:33:55.151Z"),
					subEntries: null,
				},
			],
		};

		// Value with the renamed block
		const expected = createCodeBlock(
			`{"entries":[{"name":"Block 2","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
			4,
			4
		);

		const output = replaceTimekeepCodeblock(
			inputTimekeep,
			input,
			lineStart,
			lineEnd
		);

		expect(output).toBe(expected);
	});

	it("should fail if codeblock is missing", () => {
		const input = createCodeBlock("", 4, 4);
		// Start not code fences
		expect(() =>
			replaceTimekeepCodeblock({ entries: [] }, input, 2, 4)
		).toThrow();

		// End not code fences
		expect(() =>
			replaceTimekeepCodeblock({ entries: [] }, input, 4, 8)
		).toThrow();
	});
});

describe("loading timekeep", () => {
	it("should give empty timekeep when given empty string", () => {
		const result = load("");

		expect(result.success).toBe(true);

		const successResult = result as LoadSuccess;

		// Ensure the contents match
		expect(successResult.timekeep).toEqual({ entries: [] });
	});

	it("should load valid timekeep successfully", () => {
		const data = `{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null},{"name":"Block 2","startTime":"2024-03-17T01:33:51.630Z","endTime":null,"subEntries":null},{"name":"Non Started Block","startTime":null,"endTime":null,"subEntries":null}]}`;
		const expected = {
			entries: [
				{
					name: "Block 1",
					startTime: moment("2024-03-17T01:33:51.630Z"),
					endTime: moment("2024-03-17T01:33:55.151Z"),
					subEntries: null,
				},
				{
					name: "Block 2",
					startTime: moment("2024-03-17T01:33:51.630Z"),
					endTime: null,
					subEntries: null,
				},
				{
					name: "Non Started Block",
					startTime: null,
					endTime: null,
					subEntries: null,
				},
			],
		};

		const result = load(data);

		expect(result.success).toBe(true);

		const successResult = result as LoadSuccess;

		// Ensure the contents match
		expect(stripTimekeepRuntimeData(successResult.timekeep)).toEqual(
			expected
		);
	});

	it("should give error on invalid timekeep (JSON)", () => {
		const data = "{";

		const result = load(data);

		expect(result.success).toBe(false);

		const errorResult = result as LoadError;

		expect(errorResult.error).toBe("Failed to parse timekeep JSON");
	});

	it("should tolerate a timekeep with leading or trailing whitespaces", () => {
		const input = `
		      \`\`\`timekeep
		 \`\`\` 
		`;
		// Start not code fences
		replaceTimekeepCodeblock({ entries: [] }, input, 1, 2);
	});

	it("should give error on invalid timekeep (validation)", () => {
		const data = `{"entries":[{"startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`;

		const result = load(data);

		expect(result.success).toBe(false);
	});
});

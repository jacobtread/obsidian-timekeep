/**
 * Generates a code block surrounding the provided JSON
 * with the provided leading and trailing number of lines
 *
 * @param json The JSON to put between the codeblocks
 * @param linesBefore Number of lines before the codeblock
 * @param linesAfter Number of lines after the codeblock
 * @returns The generated codeblock
 */
export function createCodeBlock(
	json: string,
	linesBefore: number,
	linesAfter: number
) {
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
}

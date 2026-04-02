import { describe, it, expect } from "vitest";

import { createCodeBlock } from "./codeblock";

describe("createCodeBlock", () => {
	it("wraps JSON with codeblock and default lines", () => {
		const json = '{"entries":[]}';
		const result = createCodeBlock(json, 1, 2);
		const expected = `\n\`\`\`timekeep
{"entries":[]}
\`\`\`\n\n`;
		expect(result).toBe(expected);
	});

	it("handles zero lines before and after", () => {
		const json = '{"entries":[]}';
		const result = createCodeBlock(json, 0, 0);
		const expected = '```timekeep\n{"entries":[]}\n```';
		expect(result).toBe(expected);
	});

	it("handles only lines before", () => {
		const json = '{"entries":[]}';
		const result = createCodeBlock(json, 2, 0);
		const expected = `\n\n\`\`\`timekeep
{"entries":[]}
\`\`\``;
		expect(result).toBe(expected);
	});

	it("handles only lines after", () => {
		const json = '{"entries":[]}';
		const result = createCodeBlock(json, 0, 3);
		const expected = `\`\`\`timekeep
{"entries":[]}
\`\`\`\n\n\n`;
		expect(result).toBe(expected);
	});

	it("handles empty JSON string", () => {
		const json = "";
		const result = createCodeBlock(json, 1, 1);
		const expected = `\n\`\`\`timekeep

\`\`\`\n`;
		expect(result).toBe(expected);
	});
});

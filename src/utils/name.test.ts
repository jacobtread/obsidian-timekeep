import { NameSegmentType, parseNameSegments } from "./name";

describe("parseNameSegments", () => {
	it("should parse plain text without modification", () => {
		const input = "Hello World";
		const result = parseNameSegments(input);
		expect(result).toEqual([
			{ type: NameSegmentType.Text, text: "Hello World" },
		]);
	});

	it("should parse a Wikilink with no other content", () => {
		const input = "[[Wikilink]]";
		const result = parseNameSegments(input);
		expect(result).toEqual([
			{
				type: NameSegmentType.Link,
				url: "Wikilink",
				text: "Wikilink",
			},
		]);
	});

	it("should parse text with a Wikilink", () => {
		const input = "Hello [[Wikilink]]";
		const result = parseNameSegments(input);
		expect(result).toEqual([
			{ type: NameSegmentType.Text, text: "Hello " },
			{
				type: NameSegmentType.Link,
				url: "Wikilink",
				text: "Wikilink",
			},
		]);
	});

	it("should parse a Markdown link with no other content", () => {
		const input = "[Text](https://example.com)";
		const result = parseNameSegments(input);
		expect(result).toEqual([
			{
				type: NameSegmentType.Link,
				url: "https://example.com",
				text: "Text",
			},
		]);
	});

	it("should parse text with a Markdown link", () => {
		const input = "Hello [Text](https://example.com)";
		const result = parseNameSegments(input);
		expect(result).toEqual([
			{ type: NameSegmentType.Text, text: "Hello " },
			{
				type: NameSegmentType.Link,
				url: "https://example.com",
				text: "Text",
			},
		]);
	});

	it("should handle malformed Wikilinks gracefully", () => {
		const input = "[[Wikilink";
		const result = parseNameSegments(input);
		expect(result).toEqual([
			{ type: NameSegmentType.Text, text: "[[Wikilink" },
		]);
	});

	it("should handle malformed Markdown links gracefully", () => {
		const input = "[Text](https://example.com";
		const result = parseNameSegments(input);
		expect(result).toEqual([
			{ type: NameSegmentType.Text, text: "[Text](https://example.com" },
		]);
	});

	it("should parse a combination of Wikilinks and Markdown links", () => {
		const input = "Hello [[Wikilink]] and [Text](https://example.com)";
		const result = parseNameSegments(input);
		expect(result).toEqual([
			{ type: NameSegmentType.Text, text: "Hello " },
			{
				type: NameSegmentType.Link,
				url: "Wikilink",
				text: "Wikilink",
			},
			{ type: NameSegmentType.Text, text: " and " },
			{
				type: NameSegmentType.Link,
				url: "https://example.com",
				text: "Text",
			},
		]);
	});

	it("should parse a combination of Wikilinks and Markdown links with trailing text", () => {
		const input = "Hello [[Wikilink]] and [Text](https://example.com).";
		const result = parseNameSegments(input);
		expect(result).toEqual([
			{ type: NameSegmentType.Text, text: "Hello " },
			{
				type: NameSegmentType.Link,
				url: "Wikilink",
				text: "Wikilink",
			},
			{ type: NameSegmentType.Text, text: " and " },
			{
				type: NameSegmentType.Link,
				url: "https://example.com",
				text: "Text",
			},
			{ type: NameSegmentType.Text, text: "." },
		]);
	});

	it("should handle multiple Wikilinks correctly", () => {
		const input = "[[Link1]] and [[Link2]]";
		const result = parseNameSegments(input);
		expect(result).toEqual([
			{ type: NameSegmentType.Link, url: "Link1", text: "Link1" },
			{ type: NameSegmentType.Text, text: " and " },
			{ type: NameSegmentType.Link, url: "Link2", text: "Link2" },
		]);
	});

	it("should handle empty input gracefully", () => {
		const input = "";
		const result = parseNameSegments(input);
		expect(result).toEqual([]);
	});
});

import { isNumberText } from "@/utils/number";

export enum NameSegmentType {
	Text,
	Link,
}

export type NameSegmentText = {
	text: string;
};

export type NameSegmentLink = {
	url: string;
	text: string;
};

export type NameSegment =
	| ({ type: NameSegmentType.Text } & NameSegmentText)
	| ({ type: NameSegmentType.Link } & NameSegmentLink);

// Matches wikilinks [[link]] and markdown links [text](url)
const LINK_REGEX = /\[\[([^\]]+)\]\]|\[([^\]]+)\]\(([^)]+)\)/g;

export function parseNameSegments(input: string): NameSegment[] {
	const segments: NameSegment[] = [];

	let lastIndex = 0;

	for (const match of input.matchAll(LINK_REGEX)) {
		const index = match.index;

		// Handle the text before the current link
		const beforeLink = input.slice(lastIndex, index);
		if (beforeLink) segments.push({ type: NameSegmentType.Text, text: beforeLink });

		// Handle the matched link
		if (match[1]) {
			// Wikilink ([[link]])
			segments.push({
				type: NameSegmentType.Link,
				text: match[1],
				url: match[1],
			});
		} /* v8 ignore start -- @preserve */ else if (match[2] && match[3]) {
			/* v8 ignore stop -- @preserve */
			// Markdown link ([text](url))
			segments.push({
				type: NameSegmentType.Link,
				text: match[2],
				url: match[3],
			});
		}

		// Update lastIndex to the end of the current match
		lastIndex = index + match[0].length;
	}

	// Add any remaining text after the last link
	const remainingText = input.slice(lastIndex);
	if (remainingText) {
		segments.push({ type: NameSegmentType.Text, text: remainingText });
	}

	return segments;
}

/**
 * Checks if a name is a generic "Part 1", "Block 1" style
 * naming convention
 *
 * @param name The name
 * @returns Whether it matches the naming convention
 */
export function isGenericPartName(name: string): boolean {
	if (name.length < 1) {
		return true;
	}

	// Ignore "Part 1" "Part 2", "Block 1" ...etc
	if (name.startsWith("Part") || name.startsWith("Block")) {
		const parts = name.split(" ");
		if (parts.length !== 2) {
			return false;
		}

		const numericPart = parts[1];
		if (isNumberText(numericPart)) {
			return true;
		}
	}

	return false;
}

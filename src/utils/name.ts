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

export function parseNameSegments(input: string): NameSegment[] {
	// Matches wikilinks [[link]] and markdown links [text](url)
	const linkRegex = /\[\[([^\]]+)\]\]|\[([^\]]+)\]\(([^)]+)\)/g;
	const segments: NameSegment[] = [];

	let lastIndex = 0;

	for (const match of input.matchAll(linkRegex)) {
		const index = (match as RegExpExecArray).index;

		// Handle the text before the current link
		const beforeLink = input.slice(lastIndex, index);
		if (beforeLink)
			segments.push({ type: NameSegmentType.Text, text: beforeLink });

		// Handle the matched link
		if (match[1]) {
			// Wikilink ([[link]])
			segments.push({
				type: NameSegmentType.Link,
				text: match[1],
				url: match[1],
			});
		} else if (match[2] && match[3]) {
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

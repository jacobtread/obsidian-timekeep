import { App, Component } from "obsidian";

import {
	NameSegment,
	NameSegmentLink,
	NameSegmentText,
	NameSegmentType,
	parseNameSegments,
} from "@/utils/name";

/**
 * Component for rendering the name of a timekeep entry, this
 * handles segmenting the name into parts to allow links within
 * the name
 */
export class TimekeepName extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** Access to the obsidian app */
	app: App;

	/** Parsed segments of the name */
	segments: NameSegment[];

	constructor(containerEl: HTMLElement, app: App, name: string) {
		super();

		const segments = parseNameSegments(name);

		this.#containerEl = containerEl;
		this.app = app;
		this.segments = segments;
	}

	onload(): void {
		super.onload();

		for (const segment of this.segments) {
			switch (segment.type) {
				case NameSegmentType.Text:
					this.createTimekeepText(segment);
					break;

				case NameSegmentType.Link:
					this.createTimekeepLink(segment);
					break;
			}
		}
	}

	onunload(): void {
		super.onunload();
		this.#containerEl.empty();
	}

	createTimekeepText(segment: NameSegmentText) {
		this.#containerEl.createSpan({ text: segment.text });
	}

	createTimekeepLink(segment: NameSegmentLink) {
		const url = segment.url;
		const linkEl = this.#containerEl.createEl("a", {
			text: segment.text,
			href: url,
		});

		// Allow default behavior for external links
		if (url.startsWith("http://") || url.startsWith("https://")) {
			return;
		}

		// Register click handler for internal app links
		this.registerDomEvent(linkEl, "click", (event) => {
			this.onOpenLink(event, segment.url);
		});
	}

	onOpenLink(event: Event, url: string) {
		// Prevent the parent collapse toggle click and default behavior
		event.stopPropagation();
		event.preventDefault();

		const activeFile = this.app.workspace.getActiveFile();
		if (activeFile === null) return;

		// Open internal link
		void this.app.workspace.openLinkText(url, activeFile.path);
	}
}

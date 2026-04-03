import type { App } from "obsidian";

import {
	NameSegment,
	NameSegmentLink,
	NameSegmentText,
	NameSegmentType,
	parseNameSegments,
} from "@/utils/name";

import { DomComponent } from "./domComponent";

/**
 * Component for rendering the name of a timekeep entry, this
 * handles segmenting the name into parts to allow links within
 * the name
 */
export class TimekeepName extends DomComponent {
	/** Access to the obsidian app */
	app: App;

	/** Parsed segments of the name */
	segments: NameSegment[];

	constructor(containerEl: HTMLElement, app: App, name: string) {
		super(containerEl);

		const segments = parseNameSegments(name);

		this.app = app;
		this.segments = segments;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.containerEl.createSpan();
		this.wrapperEl = wrapperEl;

		for (const segment of this.segments) {
			switch (segment.type) {
				case NameSegmentType.Text:
					this.createTimekeepText(wrapperEl, segment);
					break;

				case NameSegmentType.Link:
					this.createTimekeepLink(wrapperEl, segment);
					break;
			}
		}
	}

	createTimekeepText(wrapperEl: HTMLElement, segment: NameSegmentText) {
		wrapperEl.createSpan({ text: segment.text });
	}

	createTimekeepLink(wrapperEl: HTMLElement, segment: NameSegmentLink) {
		const url = segment.url;
		const linkEl = wrapperEl.createEl("a", {
			text: segment.text,
		});

		// Allow default behavior for external links
		if (url.startsWith("http://") || url.startsWith("https://")) {
			linkEl.href = url;
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

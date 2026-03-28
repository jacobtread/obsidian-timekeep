import moment from "moment";
import { Component } from "obsidian";

import { getEntryDuration, isEntryRunning } from "@/timekeep";
import { TimeEntry } from "@/timekeep/schema";
import { formatDurationLong } from "@/utils";

/**
 * Component for rendering the live-updating duration on
 * an entry row
 */
export class TimesheetRowDurationComponent extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** The entry this duration belongs to */
	entry: TimeEntry;

	/** The time span element */
	#timeEl: HTMLSpanElement | undefined;

	/** Currently tracked background interval for content */
	currentContentInterval: number | undefined;

	constructor(containerEl: HTMLElement, entry: TimeEntry) {
		super();

		this.#containerEl = containerEl;
		this.entry = entry;
	}

	onload(): void {
		super.onload();

		const timeEl = this.#containerEl.createSpan({ cls: "timekeep-time" });
		this.#timeEl = timeEl;

		// Initial update
		this.updateTime();

		const isRunning = isEntryRunning(this.entry);

		// Clear the current background task
		if (this.currentContentInterval) {
			clearInterval(this.currentContentInterval);
		}

		// Only schedule further updates if we are running
		if (isRunning) {
			const intervalID = window.setInterval(this.updateTime.bind(this), 1000);

			this.currentContentInterval = intervalID;
			this.registerInterval(intervalID);
		}
	}

	/**
	 * Updates the current time duration value based
	 * on the current time
	 */
	updateTime() {
		if (!this.#timeEl) return;

		const currentTime = moment();
		const duration = getEntryDuration(this.entry, currentTime);
		const value = formatDurationLong(duration);

		this.#timeEl.textContent = value;
	}
}

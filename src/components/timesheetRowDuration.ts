import moment from "moment";

import { getEntryDuration, isEntryRunning } from "@/timekeep/queries";
import { TimeEntry } from "@/timekeep/schema";
import { formatDurationLong } from "@/utils/time";

import { DomComponent } from "./domComponent";

/**
 * Component for rendering the live-updating duration on
 * an entry row
 */
export class TimesheetRowDurationComponent extends DomComponent {
	/** The entry this duration belongs to */
	entry: TimeEntry;

	/** Currently tracked background interval for content */
	currentContentInterval: number | undefined;

	constructor(containerEl: HTMLElement, entry: TimeEntry) {
		super(containerEl);
		this.entry = entry;
	}

	onload(): void {
		super.onload();

		const timeEl = this.containerEl.createSpan({ cls: "timekeep-time" });
		this.wrapperEl = timeEl;

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
		const timeEl = this.wrapperEl;

		if (!timeEl) return;

		const currentTime = moment();
		const duration = getEntryDuration(this.entry, currentTime);
		const value = formatDurationLong(duration);

		timeEl.textContent = value;
	}
}

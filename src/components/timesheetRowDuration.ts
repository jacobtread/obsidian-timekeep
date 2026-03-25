import { TimeEntry } from "@/timekeep/schema";
import { Component } from "obsidian";
import moment from "moment";
import { getEntryDuration, isEntryRunning } from "@/timekeep";
import { formatDurationLong } from "@/utils";

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

        this.onContentUpdate();
    }

    onContentUpdate() {
        // Initial update
        this.updateTimer();

        const isRunning = isEntryRunning(this.entry);

        if (this.currentContentInterval) {
            clearInterval(this.currentContentInterval);
        }

        // Only schedule further updates if we are running
        if (isRunning) {
            const intervalID = window.setInterval(
                this.updateTimer.bind(this),
                1000
            );

            this.currentContentInterval = intervalID;
            this.registerInterval(intervalID);
        }
    }

    updateTimer() {
        if (!this.#timeEl) return;

        const value = getFormattedDuration(this.entry);
        this.#timeEl.textContent = value;
    }
}

/**
 * Obtains the formatted duration string for an entry
 *
 * @param entry The entry
 * @returns The formatted duration
 */
function getFormattedDuration(entry: TimeEntry): string {
    const currentTime = moment();
    const duration = getEntryDuration(entry, currentTime);
    return formatDurationLong(duration);
}

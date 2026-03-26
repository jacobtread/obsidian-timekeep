import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { Timekeep } from "@/timekeep/schema";
import { Component } from "obsidian";
import moment from "moment";
import { getEntryDuration, getRunningEntry, getTotalDuration, isKeepRunning } from "@/timekeep";
import { formatDuration } from "@/utils";
import { TimesheetTimer } from "./timesheetTimer";

/**
 * Component for rendering the two live updating timers at the top of the
 * time keep block
 */
export class TimesheetCounters extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;

	/** Timer for the current entry */
	currentTimer: TimesheetTimer;
	/** Timer for the total time */
	totalTimer: TimesheetTimer;

	/** Currently tracked background interval for content */
	currentContentInterval: number | undefined;

	/** Wrapper container element */
	#wrapperEl: HTMLElement | undefined;

	constructor(
		containerEl: HTMLElement,
		settings: Store<TimekeepSettings>,
		timekeep: Store<Timekeep>
	) {
		super();

		this.#containerEl = containerEl;
		this.settings = settings;
		this.timekeep = timekeep;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.#containerEl.createDiv({
			cls: "timekeep-timers",
		});
		this.#wrapperEl = wrapperEl;

		this.currentTimer = new TimesheetTimer(wrapperEl, "Current");
		this.totalTimer = new TimesheetTimer(wrapperEl, "Total");

		this.addChild(this.currentTimer);
		this.addChild(this.totalTimer);

		const onUpdate = this.onUpdate.bind(this);

		const unsubscribeTimekeep = this.timekeep.subscribe(onUpdate);
		const unsubscribeSettings = this.settings.subscribe(onUpdate);

		this.register(() => {
			unsubscribeTimekeep();
			unsubscribeSettings();
		});

		onUpdate();
	}

	onunload(): void {
		super.onunload();
		this.#wrapperEl?.remove();
	}

	/**
	 * Handles an update to either the timekeep content or the
	 * settings to update the timers data and decide whether to
	 * schedule background tasks to update timers
	 */
	onUpdate() {
		// Initial update
		this.updateTimers();

		if (this.currentContentInterval) {
			clearInterval(this.currentContentInterval);
		}

		// Only schedule further updates if we are running
		const timekeep = this.timekeep.getState();
		if (isKeepRunning(timekeep)) {
			const intervalID = window.setInterval(this.updateTimers.bind(this), 1000);

			this.currentContentInterval = intervalID;
			this.registerInterval(intervalID);
		}
	}

	/**
	 * Updates the values of the timers using the current elapsed time
	 */
	updateTimers() {
		const timekeep = this.timekeep.getState();
		const settings = this.settings.getState();

		const currentTime = moment();
		const total = getTotalDuration(timekeep.entries, currentTime);
		const runningEntry = getRunningEntry(timekeep.entries);
		const current = runningEntry ? getEntryDuration(runningEntry, currentTime) : 0;

		this.currentTimer.setHidden(runningEntry === null);
		this.currentTimer.setValues(
			formatDuration(settings.primaryDurationFormat, current),
			formatDuration(settings.secondaryDurationFormat, current)
		);

		this.totalTimer.setValues(
			formatDuration(settings.primaryDurationFormat, total),
			formatDuration(settings.secondaryDurationFormat, total)
		);
	}
}

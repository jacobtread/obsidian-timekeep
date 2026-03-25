import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";
import { Timekeep } from "@/timekeep/schema";
import { Component } from "obsidian";
import moment from "moment";
import {
    getEntryDuration,
    getRunningEntry,
    getTotalDuration,
    isKeepRunning,
} from "@/timekeep";
import { formatDuration } from "@/utils";
import { TimesheetTimer } from "./timesheetTimer";

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

        const onContentUpdate = this.onContentUpdate.bind(this);

        const unsubscribeTimekeep = this.timekeep.subscribe(onContentUpdate);
        const unsubscribeSettings = this.settings.subscribe(onContentUpdate);

        this.register(() => {
            unsubscribeTimekeep();
            unsubscribeSettings();
        });

        onContentUpdate();
    }

    onunload(): void {
        super.onunload();
        this.#wrapperEl?.remove();
    }

    onContentUpdate() {
        // Initial update
        this.updateTimers();

        if (this.currentContentInterval) {
            clearInterval(this.currentContentInterval);
        }

        // Only schedule further updates if we are running
        const timekeep = this.timekeep.getState();
        if (isKeepRunning(timekeep)) {
            const intervalID = window.setInterval(
                this.updateTimers.bind(this),
                1000
            );

            this.currentContentInterval = intervalID;
            this.registerInterval(intervalID);
        }
    }

    updateTimers() {
        const timekeep = this.timekeep.getState();
        const settings = this.settings.getState();

        const timing = getTimingState(timekeep, settings);

        this.currentTimer.setHidden(!timing.running);
        this.currentTimer.setValues(
            timing.currentPrimary,
            timing.currentSecondary
        );

        this.totalTimer.setValues(timing.totalPrimary, timing.totalSecondary);
    }
}

type TimingState = {
    running: boolean;
    currentPrimary: string;
    currentSecondary: string;
    totalPrimary: string;
    totalSecondary: string;
};

/**
 * Gets the timing state for the provided timekeep
 *
 * @param timekeep The timekeep to get the state for
 * @returns The timing state
 */
function getTimingState(
    timekeep: Timekeep,
    settings: TimekeepSettings
): TimingState {
    const currentTime = moment();
    const total = getTotalDuration(timekeep.entries, currentTime);
    const runningEntry = getRunningEntry(timekeep.entries);
    const current = runningEntry
        ? getEntryDuration(runningEntry, currentTime)
        : 0;

    return {
        running: runningEntry !== null,
        currentPrimary: formatDuration(settings.primaryDurationFormat, current),
        currentSecondary: formatDuration(
            settings.secondaryDurationFormat,
            current
        ),
        totalPrimary: formatDuration(settings.primaryDurationFormat, total),
        totalSecondary: formatDuration(settings.secondaryDurationFormat, total),
    };
}

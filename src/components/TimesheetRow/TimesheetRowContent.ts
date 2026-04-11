import type { App } from "obsidian";

import moment from "moment";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";

import { assert } from "@/utils/assert";
import { formatTimestamp } from "@/utils/time";

import { createObsidianIcon } from "@/components/obsidianIcon";
import { ReplaceableComponent } from "@/components/ReplaceableComponent";
import { TimesheetEntryDuration } from "@/components/TimesheetEntryDuration";
import { TimesheetEntryName } from "@/components/TimesheetEntryName";

import { getRunningEntry, isEntryRunning } from "@/timekeep/queries";
import type { TimeEntry, Timekeep } from "@/timekeep/schema";
import { startNewNestedEntry } from "@/timekeep/start";
import { setEntryCollapsed, updateEntry } from "@/timekeep/update";

/**
 * Component for the contents of a timesheet row
 */
export class TimesheetRowContent extends ReplaceableComponent {
	/** Access to the app instance */
	app: App;
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;

	/** The entry for this row */
	entry: TimeEntry;
	/** Indentation level for the entry */
	indent: number;

	/** Element for displaying the start time */
	#startTimeEl: HTMLSpanElement | undefined;
	/** Element for displaying the end time */
	#endTimeEl: HTMLSpanElement | undefined;

	/** Callback to begin editing the row */
	onBeginEditing: VoidFunction;

	constructor(
		containerEl: HTMLElement,
		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		entry: TimeEntry,
		indent: number,
		onBeginEditing: VoidFunction
	) {
		super(containerEl);

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;

		this.entry = entry;
		this.indent = indent;

		this.onBeginEditing = onBeginEditing;
	}

	createContainer(): HTMLElement {
		return createEl("tr", { cls: "timekeep-row" });
	}

	render(wrapperEl: HTMLElement): void {
		const entry = this.entry;
		const nameColEl = wrapperEl.createEl("td", { cls: ["timekeep-col", "timekeep-col--name"] });
		nameColEl.style.paddingLeft = `${(this.indent + 1) * 15}px`;

		const nameEl = nameColEl.createSpan({
			cls: "timekeep-entry-name",
			title: entry.name,
		});

		if (entry.subEntries !== null) {
			this.registerDomEvent(nameEl, "click", this.onToggleCollapsed.bind(this));
		}

		if (entry.subEntries !== null && entry.folder) {
			createObsidianIcon(nameEl, "folder", "timekeep-folder-icon");
		}

		const name = new TimesheetEntryName(nameEl, this.app, entry.name);
		this.addChild(name);

		if (entry.subEntries !== null) {
			createObsidianIcon(
				nameEl,
				entry.collapsed ? "chevron-down" : "chevron-up",
				"timekeep-collapse-icon"
			);
		}

		const startTimeColEl = wrapperEl.createEl("td", {
			cls: ["timekeep-col", "timekeep-col--time"],
		});
		const startTimeEl = startTimeColEl.createSpan({ cls: "timekeep-time" });
		this.#startTimeEl = startTimeEl;

		const endTimeColEl = wrapperEl.createEl("td", {
			cls: ["timekeep-col", "timekeep-col--time"],
		});
		const endTimeEl = endTimeColEl.createSpan({ cls: "timekeep-time" });
		this.#endTimeEl = endTimeEl;

		const durationColEl = wrapperEl.createEl("td", {
			cls: ["timekeep-col", "timekeep-col--duration"],
		});

		const duration = new TimesheetEntryDuration(durationColEl, entry);

		this.addChild(duration);

		const actionsColEl = wrapperEl.createEl("td", {
			cls: ["timekeep-col", "timekeep-col-actions"],
		});

		const actionsWrapper = actionsColEl.createDiv({ cls: "timekeep-actions-wrapper" });

		const startButton = actionsWrapper.createEl("button", {
			cls: "timekeep-action",
			attr: {
				"data-action": "start",
			},
		});
		createObsidianIcon(startButton, "play", "button-icon");
		this.registerDomEvent(startButton, "click", this.onClickStart.bind(this));

		const editButton = actionsWrapper.createEl("button", {
			cls: "timekeep-action",
			attr: {
				"data-action": "edit",
			},
		});
		createObsidianIcon(editButton, "edit", "button-icon");
		this.registerDomEvent(editButton, "click", this.onBeginEditing);

		this.updateTimes();
		this.updateState();

		const unsubscribeSettings = this.settings.subscribe(this.updateTimes.bind(this));

		this.register(unsubscribeSettings);
	}

	updateTimes() {
		assert(this.#startTimeEl && this.#endTimeEl, "Time elements should be defined");

		const entry = this.entry;
		const settings = this.settings.getState();

		this.#startTimeEl.textContent = entry.startTime
			? formatTimestamp(entry.startTime, settings)
			: "";

		this.#endTimeEl.textContent = entry.endTime ? formatTimestamp(entry.endTime, settings) : "";
	}

	updateState() {
		assert(this.containerEl, "Container should be defined");

		const entry = this.entry;

		const isSelfRunning = entry.subEntries === null && isEntryRunning(entry);

		const isRunningWithin =
			entry.subEntries !== null && getRunningEntry(entry.subEntries) !== null;

		const isInvalidEntry =
			entry.startTime !== null &&
			entry.endTime !== null &&
			entry.endTime.isBefore(entry.startTime);

		const rowEl = this.containerEl;
		rowEl.setAttribute("data-running", String(isSelfRunning));
		rowEl.setAttribute("data-running-within", String(isRunningWithin));
		rowEl.setAttribute("data-sub-entries", String(this.entry.subEntries !== null));
		rowEl.setAttribute("data-invalid", String(isInvalidEntry));
	}

	onToggleCollapsed() {
		const entry = this.entry;
		assert(entry.subEntries !== null, "Expected collapse toggling to only be possible on entries with subEntries");

		this.timekeep.setState((timekeep) => {
			const newEntry = setEntryCollapsed(entry, !entry.collapsed);
			const entries = updateEntry(timekeep.entries, entry.id, newEntry);
			return { ...timekeep, entries };
		});
	}

	onClickStart() {
		const entry = this.entry;

		this.timekeep.setState((timekeep) => {
			const currentTime = moment();
			const entries = startNewNestedEntry(currentTime, entry.id, timekeep.entries);
			return { ...timekeep, entries };
		});
	}
}

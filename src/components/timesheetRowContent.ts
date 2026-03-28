import moment from "moment";
import { App, Component } from "obsidian";

import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";
import {
	getRunningEntry,
	isEntryRunning,
	setEntryCollapsed,
	startNewNestedEntry,
	updateEntry,
} from "@/timekeep";
import { TimeEntry, Timekeep } from "@/timekeep/schema";
import { formatTimestamp } from "@/utils";

import { createObsidianIcon } from "./obsidianIcon";
import { TimekeepName } from "./timesheetName";
import { TimesheetRowDurationComponent } from "./timesheetRowDuration";

/**
 * Component for the contents of a timesheet row
 */
export class TimesheetRowContent extends Component {
	/** The row element */
	#rowEl: HTMLTableRowElement;

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
	/** Loaded column elements */
	#columns: HTMLTableCellElement[] = [];

	/** Callback to begin editing the row */
	onBeginEditing: VoidFunction;

	constructor(
		rowEl: HTMLTableRowElement,
		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		entry: TimeEntry,
		indent: number,
		onBeginEditing: VoidFunction
	) {
		super();

		this.#rowEl = rowEl;

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;

		this.entry = entry;
		this.indent = indent;

		this.onBeginEditing = onBeginEditing;
	}

	onload(): void {
		super.onload();

		const entry = this.entry;
		const rowEl = this.#rowEl;

		const nameColEl = rowEl.createEl("td", {
			cls: ["timekeep-col", "timekeep-col--name"],
		});

		nameColEl.style.paddingLeft = `${(this.indent + 1) * 15}px`;

		const nameEl = nameColEl.createSpan({
			cls: "timekeep-entry-name",
			title: entry.name,
		});

		this.registerDomEvent(nameEl, "click", this.onToggleCollapsed.bind(this));

		if (entry.subEntries !== null && entry.folder) {
			createObsidianIcon(nameEl, "folder", "timekeep-folder-icon");
		}

		const name = new TimekeepName(nameEl, this.app, entry.name);
		this.addChild(name);

		if (entry.subEntries !== null) {
			createObsidianIcon(
				nameEl,
				entry.collapsed ? "chevron-down" : "chevron-up",
				"timekeep-collapse-icon"
			);
		}

		const startTimeColEl = rowEl.createEl("td", {
			cls: ["timekeep-col", "timekeep-col--time"],
		});

		const startTimeEl = startTimeColEl.createSpan({
			cls: "timekeep-time",
			text: "",
		});

		this.#startTimeEl = startTimeEl;

		const endTimeColEl = rowEl.createEl("td", {
			cls: ["timekeep-col", "timekeep-col--time"],
		});

		const endTimeEl = endTimeColEl.createSpan({
			cls: "timekeep-time",
			text: "",
		});

		this.#endTimeEl = endTimeEl;

		const durationColEl = rowEl.createEl("td", {
			cls: ["timekeep-col", "timekeep-col--duration"],
		});

		const duration = new TimesheetRowDurationComponent(durationColEl, entry);

		this.addChild(duration);

		const actionsColEl = rowEl.createEl("td", {
			cls: ["timekeep-col", "timekeep-col-actions"],
		});

		const actionsWrapper = actionsColEl.createDiv({
			cls: "timekeep-actions-wrapper",
		});

		const startButton = actionsWrapper.createEl("button", {
			cls: "timekeep-action",
		});

		createObsidianIcon(startButton, "play", "button-icon");

		const editButton = actionsWrapper.createEl("button", {
			cls: "timekeep-action",
		});

		createObsidianIcon(editButton, "edit", "button-icon");

		this.registerDomEvent(startButton, "click", this.onClickStart.bind(this));

		this.registerDomEvent(editButton, "click", this.onBeginEditing);

		this.updateTimes();
		this.updateState();

		const unsubscribeSettings = this.settings.subscribe(this.updateTimes.bind(this));

		this.register(unsubscribeSettings);

		this.#columns.push(nameColEl, startTimeColEl, endTimeColEl, durationColEl, actionsColEl);
	}

	onunload(): void {
		super.onunload();

		// Remove the loaded columns
		for (const column of this.#columns) {
			column.remove();
		}
	}

	updateTimes() {
		if (!this.#startTimeEl || !this.#endTimeEl) return;

		const entry = this.entry;
		const settings = this.settings.getState();

		this.#startTimeEl.textContent = entry.startTime
			? formatTimestamp(entry.startTime, settings)
			: "";

		this.#endTimeEl.textContent = entry.endTime ? formatTimestamp(entry.endTime, settings) : "";
	}

	updateState() {
		if (!this.#rowEl) return;

		const entry = this.entry;

		const isSelfRunning = entry.subEntries === null && isEntryRunning(entry);

		const isRunningWithin =
			entry.subEntries !== null && getRunningEntry(entry.subEntries) !== null;

		const isInvalidEntry =
			entry.startTime !== null &&
			entry.endTime !== null &&
			entry.endTime.isBefore(entry.startTime);

		const rowEl = this.#rowEl;

		rowEl.setAttribute("data-running", String(isSelfRunning));
		rowEl.setAttribute("data-running-within", String(isRunningWithin));
		rowEl.setAttribute("data-sub-entires", String(this.entry.subEntries !== null));
		rowEl.setAttribute("data-invalid", String(isInvalidEntry));
	}

	onToggleCollapsed() {
		const entry = this.entry;
		if (entry.subEntries === null) return;

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

			return {
				...timekeep,
				entries,
			};
		});
	}
}

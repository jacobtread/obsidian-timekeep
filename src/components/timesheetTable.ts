import type { App } from "obsidian";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { Timekeep } from "@/timekeep/schema";

import { getEntriesSorted } from "@/timekeep/sort";
import { assert } from "@/utils/assert";

import { DomComponent } from "./domComponent";
import { TimesheetRowContainer } from "./timesheetRowContainer";

/**
 * Table component for rendering the contents of the timekeep
 */
export class TimesheetTable extends DomComponent {
	/** Access to the app instance */
	app: App;
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;

	/** Table body for row content */
	#bodyEl: HTMLElement | undefined;

	/** Currently mounted row children */
	#rows: TimesheetRowContainer[] = [];

	constructor(
		containerEl: HTMLElement,
		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>
	) {
		super(containerEl);

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.containerEl.createDiv();
		this.wrapperEl = wrapperEl;

		const tableEl = wrapperEl.createEl("table", { cls: "timekeep-table" });
		const tableHeadEl = tableEl.createEl("thead", {
			cls: "timekeep-table-head",
		});

		const tableHeadRowEl = tableHeadEl.createEl("tr");
		tableHeadRowEl.createEl("th", { text: "Block" });
		tableHeadRowEl.createEl("th", { text: "Start time" });
		tableHeadRowEl.createEl("th", { text: "End time" });
		tableHeadRowEl.createEl("th", { text: "Duration" });
		tableHeadRowEl.createEl("th", { text: "Actions" });

		const bodyEl = tableEl.createEl("tbody");
		this.#bodyEl = bodyEl;

		const onUpdate = this.onUpdate.bind(this);

		const unsubscribeSettings = this.settings.subscribe(onUpdate);
		const unsubscribeTimekeep = this.timekeep.subscribe(onUpdate);

		this.register(unsubscribeSettings);
		this.register(unsubscribeTimekeep);

		onUpdate();
	}

	/**
	 * Update the content, called when the settings or the
	 * timekeep data are updated
	 */
	onUpdate() {
		this.clearRows();
		this.updateWrapperSize();
		this.renderRows();
	}

	/**
	 * Update the size of the wrapper the contains the table element
	 * based on the current settings
	 */
	updateWrapperSize() {
		const wrapperEl = this.wrapperEl;
		assert(wrapperEl, "Wrapper element should be defined");

		const settings = this.settings.getState();

		if (settings.limitTableSize) {
			wrapperEl.style.maxHeight = "600px";
			wrapperEl.style.overflowY = "auto";
		} else {
			wrapperEl.style.removeProperty("maxHeight");
			wrapperEl.style.removeProperty("overflowY");
		}
	}

	/**
	 * Remove the existing rows from the table body children
	 */
	clearRows() {
		// Unload existing children and reset the rows list
		for (const row of this.#rows) {
			this.removeChild(row);
		}

		this.#rows = [];
	}

	/**
	 * Creates the table content and appends it as children
	 * of the body
	 */
	renderRows() {
		const bodyEl = this.#bodyEl;
		assert(bodyEl, "Body element should be defined");

		const timekeep = this.timekeep.getState();
		const settings = this.settings.getState();

		const stack = getEntriesSorted(timekeep.entries, settings)
			//
			.map((entry) => ({
				entry,
				depth: 0,
			}));

		while (stack.length > 0) {
			const { entry, depth } = stack.pop()!;

			const row = new TimesheetRowContainer(
				bodyEl,
				this.app,
				this.timekeep,
				this.settings,
				entry,
				depth
			);

			this.addChild(row);
			this.#rows.push(row);

			if (entry.subEntries && !entry.collapsed && entry.subEntries.length > 0) {
				const sortedEntries = getEntriesSorted(entry.subEntries, settings);

				for (let i = sortedEntries.length - 1; i >= 0; i--) {
					stack.push({
						entry: sortedEntries[i],
						depth: depth + 1,
					});
				}
			}
		}
	}
}

import { type App, Component } from "obsidian";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { TimeEntry, Timekeep } from "@/timekeep/schema";

import { TimesheetRowContent } from "./timesheetRowContent";
import { TimesheetRowContentEditing } from "./timesheetRowContentEditing";

/**
 * This container allows a entry to switch between the default and
 * editable views without re-rendering the entire table or having a
 * large single component
 */
export class TimesheetRowContainer extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

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

	/** The row element */
	#rowEl: HTMLTableRowElement | undefined;
	/** Current rendered row content */
	#content: TimesheetRowContent | TimesheetRowContentEditing | undefined;

	constructor(
		containerEl: HTMLElement,
		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		entry: TimeEntry,
		indent: number
	) {
		super();

		this.#containerEl = containerEl;

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;

		this.entry = entry;
		this.indent = indent;
	}

	onload(): void {
		super.onload();

		const rowEl = this.#containerEl.createEl("tr", { cls: "timekeep-row" });
		this.#rowEl = rowEl;

		this.onViewContent();
	}

	onunload(): void {
		super.onunload();

		this.#rowEl?.remove();
	}

	onViewEditing() {
		const rowEl = this.#rowEl;
		if (!rowEl) return;

		this.swapContent(
			new TimesheetRowContentEditing(
				rowEl,
				this.app,
				this.timekeep,
				this.settings,
				this.entry,
				this.onViewContent.bind(this)
			)
		);
	}

	onViewContent() {
		const rowEl = this.#rowEl;
		if (!rowEl) return;

		this.swapContent(
			new TimesheetRowContent(
				rowEl,
				this.app,
				this.timekeep,
				this.settings,
				this.entry,
				this.indent,
				this.onViewEditing.bind(this)
			)
		);
	}

	/**
	 * Swaps the active content view with the provided content
	 *
	 * @param content The new content to show
	 */
	private swapContent(content: TimesheetRowContent | TimesheetRowContentEditing | undefined) {
		if (this.#content) {
			this.removeChild(this.#content);
		}

		this.#content = content;

		if (this.#content !== undefined) {
			this.addChild(this.#content);
		}
	}
}

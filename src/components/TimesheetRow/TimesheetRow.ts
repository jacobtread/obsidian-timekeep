import type { App } from "obsidian";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { TimeEntry, Timekeep } from "@/timekeep/schema";

import { ContentComponent } from "@/components/ContentComponent";

import { TimesheetRowContent } from "./TimesheetRowContent";
import { TimesheetRowContentEditing } from "./TimesheetRowContentEditing";

/**
 * This container allows a entry to switch between the default and
 * editable views without re-rendering the entire table or having a
 * large single component
 */
export class TimesheetRow extends ContentComponent<
	TimesheetRowContent | TimesheetRowContentEditing
> {
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

	constructor(
		containerEl: HTMLElement,
		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		entry: TimeEntry,
		indent: number
	) {
		super(containerEl);

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;

		this.entry = entry;
		this.indent = indent;
	}

	onload(): void {
		super.onload();
		this.onViewContent();
	}

	onViewEditing() {
		this.setContent(
			new TimesheetRowContentEditing(
				this.containerEl,
				this.app,
				this.timekeep,
				this.settings,
				this.entry,
				this.onViewContent.bind(this)
			)
		);
	}

	onViewContent() {
		this.setContent(
			new TimesheetRowContent(
				this.containerEl,
				this.app,
				this.timekeep,
				this.settings,
				this.entry,
				this.indent,
				this.onViewEditing.bind(this)
			)
		);
	}
}

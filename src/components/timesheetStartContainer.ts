import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { Timekeep } from "@/timekeep/schema";

import { getRunningEntry } from "@/timekeep/queries";
import { assert } from "@/utils/assert";

import { ContentComponent } from "./contentComponent";
import { TimesheetStartEditing } from "./timesheetStartEditing";
import { TimesheetStartRunning } from "./timesheetStartRunning";

export class TimesheetStartContainer extends ContentComponent<
	TimesheetStartRunning | TimesheetStartEditing
> {
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;

	constructor(
		containerEl: HTMLElement,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>
	) {
		super(containerEl);

		this.timekeep = timekeep;
		this.settings = settings;
	}

	onload(): void {
		super.onload();

		const onUpdate = this.onUpdate.bind(this);
		this.register(this.timekeep.subscribe(onUpdate));
		onUpdate();
	}

	onUpdate() {
		if (this.getContent() instanceof TimesheetStartEditing) {
			this.setEditingView();
			return;
		}

		this.setCurrentView();
	}

	/**
	 * Switch to the editing view
	 */
	setEditingView() {
		const contentEl = this.containerEl;
		assert(contentEl, "Content element should be defined");

		const timekeep = this.timekeep.getState();
		const currentEntry = getRunningEntry(timekeep.entries);
		if (!currentEntry) {
			this.setContent(undefined);
			return;
		}

		this.setContent(
			new TimesheetStartEditing(
				contentEl,
				this.timekeep,
				this.settings,
				currentEntry.name,
				this.setCurrentView.bind(this)
			)
		);
	}

	/**
	 * Switch to the default creation view
	 */
	setCurrentView() {
		const contentEl = this.containerEl;
		assert(contentEl, "Content element should be defined");

		const timekeep = this.timekeep.getState();
		const currentEntry = getRunningEntry(timekeep.entries);
		if (!currentEntry) {
			this.setContent(undefined);
			return;
		}

		this.setContent(
			new TimesheetStartRunning(
				contentEl,
				this.timekeep,
				this.settings,
				currentEntry,
				this.setEditingView.bind(this)
			)
		);
	}
}

import { App } from "obsidian";

import { DomComponent } from "@/components/DomComponent";
import { createObsidianIcon } from "@/components/obsidianIcon";
import { TimesheetEntryDuration } from "@/components/TimesheetEntryDuration";

import { TimeEntry } from "@/timekeep/schema";

import { TimekeepRegistry, TimekeepRegistryItemRef } from "@/service/registry";

export class TimesheetStatusBarItem extends DomComponent {
	/** Access to the obsidian app */
	app: App;
	/** The entry this duration belongs to */
	entry: TimeEntry;
	/** The registry for timekeeps */
	registry: TimekeepRegistry;
	/** The reference to the item */
	ref: TimekeepRegistryItemRef;

	constructor(
		containerEl: HTMLElement,
		app: App,
		registry: TimekeepRegistry,
		entry: TimeEntry,
		ref: TimekeepRegistryItemRef
	) {
		super(containerEl);

		this.app = app;
		this.registry = registry;
		this.entry = entry;
		this.ref = ref;
	}

	onload(): void {
		super.onload();

		const entry = this.entry;
		const wrapperEl = this.containerEl.createDiv({ cls: "timekeep-status-item" });
		this.wrapperEl = wrapperEl;

		const stopIcon = createObsidianIcon(wrapperEl, "stop-circle", [
			"timekeep-status-item__button",
			"timekeep-button-icon",
		]);
		stopIcon.title = "Stop Entry";

		const contentEl = wrapperEl.createDiv({
			cls: "timekeep-status-item__content",
			title: "Open File",
		});

		contentEl.createSpan({
			cls: "timekeep-status-item__name",
			text: entry.name + ":",
		});

		this.addChild(new TimesheetEntryDuration(contentEl, entry));

		this.registerDomEvent(stopIcon, "click", this.onStop.bind(this));
		this.registerDomEvent(contentEl, "click", this.onOpen.bind(this));
	}

	async onStop() {
		try {
			await this.registry.tryStopEntry(this.ref);
		} catch (e) {
			console.error("Failed to stop timekeep", e);
		}
	}

	async onOpen() {
		await TimekeepRegistry.openItemRef(this.app.workspace, this.ref);
	}
}

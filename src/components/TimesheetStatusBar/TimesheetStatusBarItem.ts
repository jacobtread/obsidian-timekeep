import { App } from "obsidian";

import { TimekeepSettings } from "@/settings";
import { isGenericPartName } from "@/utils/name";

import { DomComponent } from "@/components/DomComponent";
import { createObsidianIcon } from "@/components/obsidianIcon";
import { TimesheetEntryDuration } from "@/components/TimesheetEntryDuration";

import { getPathToEntry } from "@/timekeep/queries";
import { TimeEntry, Timekeep } from "@/timekeep/schema";

import {
	TimekeepEntryItemType,
	TimekeepRegistry,
	TimekeepRegistryItemRef,
} from "@/service/registry";

export class TimesheetStatusBarItem extends DomComponent {
	/** Access to the obsidian app */
	app: App;
	/** The entry this duration belongs to */
	entry: TimeEntry;
	/** The registry for timekeeps */
	registry: TimekeepRegistry;
	/** The current timekeep settings */
	settings: TimekeepSettings;
	/** The full timekeep */
	timekeep: Timekeep;
	/** The reference to the item */
	ref: TimekeepRegistryItemRef;

	constructor(
		containerEl: HTMLElement,
		app: App,
		registry: TimekeepRegistry,
		settings: TimekeepSettings,
		entry: TimeEntry,
		timekeep: Timekeep,
		ref: TimekeepRegistryItemRef
	) {
		super(containerEl);

		this.app = app;
		this.registry = registry;
		this.settings = settings;
		this.entry = entry;
		this.timekeep = timekeep;
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
			text: this.getFolderPath() + this.getEntryNearestName() + entry.name + ":",
			title: this.getDisplayTitle(),
		});

		this.addChild(new TimesheetEntryDuration(contentEl, entry));

		this.registerDomEvent(stopIcon, "click", this.onStop.bind(this));
		this.registerDomEvent(contentEl, "click", this.onOpen.bind(this));
	}

	getDisplayTitle() {
		switch (this.ref.type) {
			case TimekeepEntryItemType.FILE:
				return `${this.ref.file.path}`;
			case TimekeepEntryItemType.MARKDOWN:
				return `${this.ref.file.path} - ${this.ref.position.startLine}:${this.ref.position.endLine}`;
			/* v8 ignore start -- @preserve */
			default: {
				throw new Error("unknown entry type");
			}
			/* v8 ignore stop -- @preserve */
		}
	}

	getEntryNearestName() {
		if (!this.settings.statusBarPreferNonGenericParent) return "";

		const path = getPathToEntry(this.timekeep.entries, this.entry);
		if (path.length < 2) return "";

		for (let i = path.length - 2; i >= 0; i -= 1) {
			const segment = path[i];
			if (isGenericPartName(segment.name)) continue;
			return `${segment.name} / `;
		}

		return "";
	}

	getFolderPath() {
		if (!this.settings.statusBarShowFolderPath) return "";
		const path = this.ref.file.path;
		const parts = path.split("/");
		if (parts.length < 2) return "";
		return parts.slice(0, parts.length - 1).join("/") + ": ";
	}

	async onStop() {
		try {
			await this.registry.tryStopEntry(this.ref);
		} catch (e) {
			console.error("Failed to stop timekeep", e);
		}
	}

	async onOpen() {
		await TimekeepRegistry.openItemRef(
			this.app.workspace,
			this.ref,
			this.settings.statusBarItemOpenNewTab
		);
	}
}

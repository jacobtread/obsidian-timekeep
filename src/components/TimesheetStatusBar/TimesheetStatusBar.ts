import { type App } from "obsidian";
import { Component } from "obsidian";

import { TimesheetStatusBarItem } from "./TimesheetStatusBarItem";

import { getRunningEntry } from "@/timekeep/queries";
import { Timekeep } from "@/timekeep/schema";

import {
	TimekeepEntryItemType,
	TimekeepRegistry,
	TimekeepRegistryItemRef,
} from "@/service/registry";

export class TimesheetStatusBar extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** Wrapper container element for entries */
	#wrapperEl: HTMLElement;

	/** Access to the app instance */
	app: App;
	/** Access to the app registry */
	registry: TimekeepRegistry;

	/** Currently rendered items */
	items: TimesheetStatusBarItem[] = [];

	constructor(containerEl: HTMLElement, app: App, registry: TimekeepRegistry) {
		super();

		this.#containerEl = containerEl;

		this.app = app;
		this.registry = registry;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.#containerEl.createDiv({ cls: "timekeep-status-bar" });
		this.#wrapperEl = wrapperEl;

		const render = this.render.bind(this);
		const unsubscribe = this.registry.entries.subscribe(render);
		this.register(unsubscribe);
		render();
	}

	onunload(): void {
		super.onunload();
		this.#containerEl?.remove();
	}

	render() {
		const entries = this.registry.entries.getState();

		// Unload the current children
		for (const item of this.items) {
			item.unload();
		}

		// Load the new children
		for (const entry of entries) {
			if (entry.type === TimekeepEntryItemType.FILE) {
				const ref: TimekeepRegistryItemRef = {
					file: entry.file,
					type: TimekeepEntryItemType.FILE,
				};

				this.renderEntry(entry.timekeep, ref);
			} else if (entry.type === TimekeepEntryItemType.MARKDOWN) {
				for (const timekeep of entry.timekeeps) {
					const ref: TimekeepRegistryItemRef = {
						file: entry.file,
						type: TimekeepEntryItemType.MARKDOWN,
						position: timekeep,
					};

					this.renderEntry(timekeep.timekeep, ref);
				}
			}
		}
	}

	renderEntry(timekeep: Timekeep, ref: TimekeepRegistryItemRef) {
		const wrapperEl = this.#wrapperEl;
		if (!wrapperEl) return;

		const runningEntry = getRunningEntry(timekeep.entries);
		if (runningEntry === null) return;

		const item = new TimesheetStatusBarItem(
			wrapperEl,
			runningEntry,
			() => {
				void this.onOpen(ref);
			},
			() => {
				void this.onStop(ref);
			}
		);

		this.items.push(item);
		item.load();
	}

	async onStop(ref: TimekeepRegistryItemRef) {
		try {
			await this.tryStop(ref);
		} catch (e) {
			console.error("Failed to stop timekeep", e);
		}
	}

	async tryStop(ref: TimekeepRegistryItemRef) {
		await this.registry.tryStopEntry(ref);
	}

	async onOpen(ref: TimekeepRegistryItemRef) {
		await TimekeepRegistry.openItemRef(this.app.workspace, ref);
	}
}

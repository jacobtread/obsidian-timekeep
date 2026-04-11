import { type App } from "obsidian";
import { Component } from "obsidian";
import { assert } from "vitest";

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
	wrapperEl: HTMLElement;

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
		this.wrapperEl = wrapperEl;

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
			switch (entry.type) {
				case TimekeepEntryItemType.FILE: {
					const ref: TimekeepRegistryItemRef = {
						file: entry.file,
						type: TimekeepEntryItemType.FILE,
					};

					this.renderEntry(entry.timekeep, ref);
					break;
				}
				case TimekeepEntryItemType.MARKDOWN: {
					for (const timekeep of entry.timekeeps) {
						const ref: TimekeepRegistryItemRef = {
							file: entry.file,
							type: TimekeepEntryItemType.MARKDOWN,
							position: timekeep,
						};

						this.renderEntry(timekeep.timekeep, ref);
					}
					break;
				}
				/* v8 ignore start -- @preserve */
				default: {
					throw new Error("unknown entry type");
				}
				/* v8 ignore stop -- @preserve */
			}
		}
	}

	renderEntry(timekeep: Timekeep, ref: TimekeepRegistryItemRef) {
		const wrapperEl = this.wrapperEl;
		assert(wrapperEl, "Wrapper element should be defined on render");

		const runningEntry = getRunningEntry(timekeep.entries);
		if (runningEntry === null) return;

		const item = new TimesheetStatusBarItem(
			wrapperEl,
			this.app,
			this.registry,
			runningEntry,
			ref
		);
		this.items.push(item);
		item.load();
	}
}

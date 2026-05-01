import { type App } from "obsidian";
import { Component } from "obsidian";

import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";
import { assert } from "@/utils/assert";

import { TimesheetStatusBarItem } from "./TimesheetStatusBarItem";

import { TimeEntry } from "@/timekeep/schema";

import { TimekeepRegistry, TimekeepRegistryItemRef } from "@/service/registry";

export class TimesheetStatusBar extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** Wrapper container element for entries */
	wrapperEl: HTMLElement | undefined;

	/** Access to the app instance */
	app: App;
	/** Access to the app registry */
	registry: TimekeepRegistry;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;

	/** Currently rendered items */
	items: TimesheetStatusBarItem[] = [];

	constructor(
		containerEl: HTMLElement,
		app: App,
		registry: TimekeepRegistry,
		settings: Store<TimekeepSettings>
	) {
		super();

		this.#containerEl = containerEl;

		this.app = app;
		this.registry = registry;
		this.settings = settings;
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
		// No need to subscribe to settings, this component is recreated when settings changes
		const settings = this.settings.getState();


		const entries = this.registry.entries.getState();
		const runningEntries = TimekeepRegistry.getRunningEntries(entries);

		// Unload the current children
		for (const item of this.items) {
			item.unload();
		}

		// Load the new children
		for (const runningEntry of runningEntries) {
			this.renderEntry(runningEntry.running, runningEntry.ref, settings);
		}
	}

	renderEntry(entry: TimeEntry, ref: TimekeepRegistryItemRef, settings: TimekeepSettings) {
		const wrapperEl = this.wrapperEl;
		assert(wrapperEl, "Wrapper element should be defined on render");
		const item = new TimesheetStatusBarItem(
			wrapperEl,
			this.app,
			this.registry,
			entry,
			ref,
			settings.statusBarShowFolderPath
		);
		this.items.push(item);
		item.load();
	}
}

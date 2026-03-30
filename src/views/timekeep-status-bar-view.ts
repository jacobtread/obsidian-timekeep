import moment from "moment";
import { App, Component, MarkdownView, Notice } from "obsidian";

import { TimesheetStatusBarItem } from "@/components/timesheetStatusBarItem";
import { TimekeepRegistry, TimekeepRegistryEntry } from "@/service/registry";
import {
	extractTimekeepCodeblocksWithPosition,
	replaceTimekeepCodeblock,
	TimekeepWithPosition,
} from "@/timekeep/parser";
import { getRunningEntry } from "@/timekeep/queries";
import { stopRunningEntries } from "@/timekeep/update";

export class TimekeepStatusBarView extends Component {
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
		const wrapperEl = this.#wrapperEl;
		if (!wrapperEl) return;

		const entries = this.registry.entries.getState();

		// Unload the current children
		for (const item of this.items) {
			item.unload();
		}

		// Load the new children
		for (const entry of entries) {
			for (const timekeep of entry.timekeeps) {
				const runningEntry = getRunningEntry(timekeep.timekeep.entries);
				if (runningEntry === null) continue;

				const item = new TimesheetStatusBarItem(
					wrapperEl,
					runningEntry,
					() => {
						void this.onOpen(entry, timekeep);
					},
					() => {
						void this.onStop(entry, timekeep);
					}
				);

				this.items.push(item);
				item.load();
			}
		}
	}

	async onStop(entry: TimekeepRegistryEntry, timekeep: TimekeepWithPosition) {
		try {
			await this.tryStop(entry, timekeep);
		} catch (e) {
			console.error("Failed to stop timekeep", e);
		}
	}

	async tryStop(entry: TimekeepRegistryEntry, position: TimekeepWithPosition) {
		const file = entry.file;

		// Ensure the file still exists
		if (file === null) throw new Error("File no longer exists");

		// Replace the stored timekeep block with the new one
		await this.app.vault.process(file, (data) => {
			const timekeeps = extractTimekeepCodeblocksWithPosition(data);
			const targetTimekeep = timekeeps.find(
				(target) =>
					target.startLine === position.startLine && target.endLine === position.endLine
			);

			// Don't modify the file if we can't find the timekeep
			if (targetTimekeep === undefined) {
				new Notice("Failed to stop timekeep: Unable to find timekeep within file", 1500);
				return data;
			}

			const currentTime = moment();
			const initialTimekeep = targetTimekeep.timekeep;
			const updatedTimekeep = {
				...initialTimekeep,
				entries: stopRunningEntries(initialTimekeep.entries, currentTime),
			};

			return replaceTimekeepCodeblock(
				updatedTimekeep,
				data,
				targetTimekeep.startLine,
				targetTimekeep.endLine
			);
		});
	}

	async onOpen(entry: TimekeepRegistryEntry, timekeep: TimekeepWithPosition) {
		const leaf = this.app.workspace.getLeaf();
		await leaf.openFile(entry.file);

		const view = leaf.view;

		if (view instanceof MarkdownView) {
			const editor = view.editor;

			const line = timekeep.startLine;

			// Focus the line we opened to
			editor.setCursor({ line: Math.max(line - 1, 0), ch: 0 });
			editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true);
		}
	}
}

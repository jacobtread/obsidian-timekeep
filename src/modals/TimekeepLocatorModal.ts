import type { App } from "obsidian";

import { SuggestModal } from "obsidian";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";

import { getRunningEntry } from "@/timekeep/queries";
import type { TimeEntry } from "@/timekeep/schema";

import {
	TimekeepEntryItemType,
	TimekeepRegistry,
	TimekeepRegistryEntry,
	TimekeepRegistryItemRef,
} from "@/service/registry";

interface TimekeepResult {
	ref: TimekeepRegistryItemRef;
	running: TimeEntry;
}

export class TimekeepLocatorModal extends SuggestModal<TimekeepResult> {
	results: TimekeepResult[] | undefined = undefined;
	registry: TimekeepRegistry;
	settings: Store<TimekeepSettings>;

	constructor(app: App, registry: TimekeepRegistry, settings: Store<TimekeepSettings>) {
		super(app);
		this.registry = registry;
		this.settings = settings;
	}

	async getSuggestions(query: string): Promise<TimekeepResult[]> {
		const settings = this.settings.getState();

		// When the registry is enabled source the entries from the registry
		// as this is much faster than triggering a search
		if (settings.registryEnabled) {
			const entries = this.registry.entries.getState();
			const results: TimekeepResult[] = TimekeepLocatorModal.getResultsFromEntries(entries);
			this.results = results;
		}

		// Fallback to searching using the registry logic without caching it if the
		// registry is disabled
		if (this.results === undefined) {
			const entries = await TimekeepRegistry.getTimekeepsWithinVault(this.app.vault);
			this.results = TimekeepLocatorModal.getResultsFromEntries(entries);
		}

		const queryLower = query.toLowerCase();

		return this.results.filter((result) => {
			return (
				result.running.name.toLowerCase().contains(queryLower) ||
				result.ref.file.path.toLowerCase().contains(queryLower)
			);
		});
	}

	renderSuggestion(value: TimekeepResult, el: HTMLElement) {
		el.createEl("div", { text: value.running.name });
		el.createEl("small", { text: value.ref.file.path });
	}

	async onChooseSuggestion(item: TimekeepResult, _evt: MouseEvent | KeyboardEvent) {
		await TimekeepRegistry.openItemRef(this.app.workspace, item.ref);
	}

	static getResultsFromEntries(entries: TimekeepRegistryEntry[]): TimekeepResult[] {
		const results: TimekeepResult[] = [];
		for (const entry of entries) {
			switch (entry.type) {
				case TimekeepEntryItemType.FILE: {
					const timekeep = entry.timekeep;
					const running = getRunningEntry(timekeep.entries);
					if (running !== null) {
						results.push({
							running: running,
							ref: {
								type: entry.type,
								file: entry.file,
							},
						});
					}
					break;
				}
				case TimekeepEntryItemType.MARKDOWN: {
					for (const timekeepWithPosition of entry.timekeeps) {
						const timekeep = timekeepWithPosition.timekeep;
						const running = getRunningEntry(timekeep.entries);
						if (running !== null) {
							results.push({
								running: running,
								ref: {
									type: entry.type,
									file: entry.file,
									position: timekeepWithPosition,
								},
							});
						}
					}

					break;
				}
			}
		}

		return results;
	}
}

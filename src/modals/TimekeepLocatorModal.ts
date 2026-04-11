import type { App } from "obsidian";

import { SuggestModal } from "obsidian";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";

import { TimekeepRegistry, TimekeepRunningEntry } from "@/service/registry";

export class TimekeepLocatorModal extends SuggestModal<TimekeepRunningEntry> {
	results: TimekeepRunningEntry[] | undefined = undefined;
	registry: TimekeepRegistry;
	settings: Store<TimekeepSettings>;

	constructor(app: App, registry: TimekeepRegistry, settings: Store<TimekeepSettings>) {
		super(app);
		this.registry = registry;
		this.settings = settings;
	}

	async getSuggestions(query: string): Promise<TimekeepRunningEntry[]> {
		const settings = this.settings.getState();

		// When the registry is enabled source the entries from the registry
		// as this is much faster than triggering a search
		if (settings.registryEnabled) {
			const entries = this.registry.entries.getState();
			this.results = TimekeepRegistry.getRunningEntries(entries);
		}

		// Fallback to searching using the registry logic without caching it if the
		// registry is disabled
		if (this.results === undefined) {
			const entries = await TimekeepRegistry.getTimekeepsWithinVault(this.app.vault);
			this.results = TimekeepRegistry.getRunningEntries(entries);
		}

		const queryLower = query.toLowerCase();

		return this.results.filter((result) => {
			return (
				result.running.name.toLowerCase().contains(queryLower) ||
				result.ref.file.path.toLowerCase().contains(queryLower)
			);
		});
	}

	renderSuggestion(value: TimekeepRunningEntry, el: HTMLElement) {
		el.createEl("div", { text: value.running.name });
		el.createEl("small", { text: value.ref.file.path });
	}

	async onChooseSuggestion(item: TimekeepRunningEntry, _evt: MouseEvent | KeyboardEvent) {
		await TimekeepRegistry.openItemRef(this.app.workspace, item.ref);
	}
}

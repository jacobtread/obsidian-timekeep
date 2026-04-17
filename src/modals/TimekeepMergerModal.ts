import { App, TFile, Modal, TextComponent, ButtonComponent } from "obsidian";
import { v4 as uuid } from "uuid";

import { exportPdf } from "@/export/pdf";
import { TimekeepSettings } from "@/settings";
import { Store, Unsubscribe } from "@/store";
import { assert } from "@/utils/assert";
import { createCodeBlock } from "@/utils/codeblock";

import { Timekeep, stripTimekeepRuntimeData } from "@/timekeep/schema";

import { TimekeepEntryItemType, TimekeepRegistry, TimekeepRegistryEntry } from "@/service/registry";

interface TimekeepResult {
	timekeep: Timekeep;
	file: TFile;
	index?: number;
	id: string;
}

export class TimekeepMergerModal extends Modal {
	results: TimekeepResult[] = [];
	filteredResults: TimekeepResult[] = [];
	selectedResults: TimekeepResult[] = [];

	listContainer: HTMLElement | undefined;
	searchInput: TextComponent | undefined;
	selectAll: HTMLInputElement | undefined;
	selectContainer: HTMLDivElement | undefined;
	loadingEl: HTMLDivElement | undefined;

	registry: TimekeepRegistry;
	settings: Store<TimekeepSettings>;

	/** Button for confirming the merge */
	mergeButton: ButtonComponent | undefined;

	/** Whether the dialog is exporting a merged PDF instead of creating a merged timekeep */
	exportPdf: boolean;

	unsubscribeSettings: Unsubscribe | undefined;
	unsubscribeEntries: Unsubscribe | undefined;

	constructor(
		app: App,
		registry: TimekeepRegistry,
		settings: Store<TimekeepSettings>,
		exportPdf = false
	) {
		super(app);

		this.exportPdf = exportPdf;
		this.registry = registry;
		this.settings = settings;

		this.setTitle("Create merged timekeep" + (exportPdf ? " pdf" : ""));
	}

	async onOpen(): Promise<void> {
		this.contentEl.empty();
		this.contentEl.createEl("p", { text: "Select Timekeep Entries to Merge" });

		this.loadingEl = this.contentEl.createDiv({
			cls: "timekeep-merger-loading",
			text: "Loading timekeep entries...",
		});
		this.loadingEl.style.marginBottom = "1rem";
		this.loadingEl.style.opacity = "0.7";

		this.searchInput = new TextComponent(this.contentEl);
		this.searchInput.setPlaceholder("Search by file path...");
		this.searchInput.inputEl.style.width = "100%";
		this.searchInput.setDisabled(true);
		this.searchInput.onChange(this.onUpdate.bind(this));

		const selectContainer = this.contentEl.createDiv({
			cls: "timekeep-merge-select-container",
		});

		selectContainer.style.display = "none";

		this.selectContainer = selectContainer;

		const selectAll = selectContainer.createEl("input", {
			type: "checkbox",
		});
		selectAll.checked = this.isAllSelected();
		selectAll.id = `merge-select-all`;
		selectAll.onchange = () => this.toggleSelectAll(selectAll.checked);
		this.selectAll = selectAll;

		const selectAllLabel = selectContainer.createEl("label");
		selectAllLabel.htmlFor = "merge-select-all";
		selectAllLabel.textContent = "Select All";

		this.listContainer = this.contentEl.createDiv({
			cls: "timekeep-merge-list-container",
		});

		const footer = this.contentEl.createDiv({
			cls: "timekeep-merge-footer",
		});

		this.mergeButton = new ButtonComponent(footer)
			.setButtonText("Create")
			.setCta()
			.setDisabled(true)
			.onClick(this.onMerge.bind(this));

		new ButtonComponent(footer).setButtonText("Cancel").onClick(this.close.bind(this));

		await this.onLoad();

		// Handle loading when settings or
		this.unsubscribeSettings = this.settings.subscribe(this.onLoad.bind(this));
		this.unsubscribeEntries = this.registry.entries.subscribe(this.onLoad.bind(this));
	}

	async onLoad() {
		assert(
			this.loadingEl && this.mergeButton && this.searchInput,
			"Required elements should be defined"
		);

		this.loadingEl.style.opacity = "0.7";
		this.loadingEl.hidden = false;
		this.mergeButton.setDisabled(true);
		this.searchInput.setDisabled(true);

		try {
			const settings = this.settings.getState();

			// When the registry is enabled source the entries from the registry
			// as this is much faster than triggering a search
			if (settings.registryEnabled) {
				const entries = this.registry.entries.getState();
				const results: TimekeepResult[] =
					TimekeepMergerModal.getResultsFromEntries(entries);

				// Wait for registry load tasks if they aren't finished
				await this.registry.waitTasks();

				this.results = results;
			}

			// Fallback to searching using the registry logic without caching it if the
			// registry is disabled
			if (this.results === undefined) {
				const entries = await TimekeepRegistry.getTimekeepsWithinVault(this.app.vault);
				this.results = TimekeepMergerModal.getResultsFromEntries(entries);
			}

			this.loadingEl.hidden = true;
		} catch (err) {
			console.error(err);
			this.loadingEl.setText("Failed to load timekeep entries.");
			this.loadingEl.style.opacity = "1";
		} finally {
			this.mergeButton.setDisabled(false);
			this.searchInput.setDisabled(false);
			this.onUpdate();
		}
	}

	onMerge() {
		const timekeep: Timekeep = { entries: [] };

		for (const result of this.selectedResults) {
			timekeep.entries.push(...result.timekeep.entries);
		}

		// Close after taking the results as closing resets the list
		this.close();

		if (this.exportPdf) {
			// Export a pdf
			void exportPdf(this.app, timekeep, this.settings.getState());
			return;
		}

		// Insert into editor
		const editor = this.app.workspace.activeEditor?.editor;
		if (!editor) return;

		const stripped = stripTimekeepRuntimeData(timekeep);
		const serialized = JSON.stringify(stripped);
		editor.replaceSelection(createCodeBlock(serialized, 1, 1));
	}

	onUpdate() {
		this.updateFilteredResults();
		this.renderList();
		this.updateSelectAll();
	}

	updateSelectAll() {
		if (this.selectContainer) {
			this.selectContainer.style.display = this.filteredResults.length > 0 ? "flex" : "none";
		}

		const isAllSelected = this.isAllSelected();
		if (this.selectAll) {
			this.selectAll.checked = isAllSelected;
		}
	}

	/**
	 * Check if the whole filtered result set is selected
	 */
	isAllSelected() {
		// Must have at least one result to be selected
		if (this.filteredResults.length < 1) {
			return false;
		}

		for (const result of this.filteredResults) {
			const selected = this.selectedResults.find((selected) => selected.id === result.id);

			if (selected === undefined) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Toggle the "select all" for the current filtered result set
	 *
	 * When checked adds all visible results to the current selection
	 * When unchecked removes all visible results from the current selection
	 *
	 * @param checked Whether to select all
	 */
	toggleSelectAll(checked: boolean) {
		if (checked) {
			// Find all results that aren't already selected
			const toBeSelected = this.filteredResults.filter((result) => {
				const selected = this.selectedResults.find((selected) => selected.id === result.id);
				return selected === undefined;
			});

			this.selectedResults = [...this.selectedResults, ...toBeSelected];
		} else {
			// Keep only the results that aren't in the current filtered list
			this.selectedResults = this.selectedResults.filter((selected) => {
				const filtered = this.filteredResults.find(
					(filtered) => filtered.id === selected.id
				);
				return filtered === undefined;
			});
		}

		// Re-render the list with the new selection
		this.renderList();
	}

	/**
	 * Update the current filtered results to match the
	 * search query
	 */
	updateFilteredResults() {
		assert(this.searchInput, "Search input should be defined");

		const queryLower = this.searchInput.getValue().toLowerCase().trim();
		if (queryLower.length < 1) {
			this.filteredResults = this.results;
			return;
		}

		this.filteredResults = this.results.filter((result) => {
			return result.file.path.toLowerCase().contains(queryLower);
		});
	}

	/**
	 * Render the list of filtered results
	 */
	renderList() {
		assert(this.listContainer, "List container should be defined for renderList");

		this.listContainer.empty();
		for (const result of this.filteredResults) {
			const itemEl = this.listContainer.createEl("label", {
				cls: "timekeep-merge-item",
			});
			itemEl.htmlFor = `timekeep-${result.id}`;

			const checkbox = itemEl.createEl("input", {
				cls: "timekeep-merge-item-checkbox",
				type: "checkbox",
			});
			checkbox.checked =
				this.selectedResults.find((other) => other.id === result.id) !== undefined;
			checkbox.id = `timekeep-${result.id}`;

			checkbox.onchange = () => {
				if (checkbox.checked) {
					this.selectedResults = [...this.selectedResults, result];
				} else {
					this.selectedResults = this.selectedResults.filter(
						(other) => other.id !== result.id
					);
				}
			};

			const label = itemEl.createDiv({
				cls: "timekeep-merge-item-label",
			});

			const title = label.createEl("span", {
				cls: "timekeep-merge-item-title",
			});
			title.textContent = result.index
				? `${result.file.basename}: Timekeep ${result.index + 1}`
				: `${result.file.basename}`;

			const path = label.createEl("span", {
				cls: "timekeep-merge-item-path",
			});
			path.textContent = `${result.file.path}`;
		}
	}

	onClose(): void {
		this.results = [];
		this.filteredResults = [];
		this.selectedResults = [];
		this.contentEl.empty();

		this.searchInput = undefined;
		this.listContainer = undefined;
		this.selectAll = undefined;

		if (this.unsubscribeEntries) this.unsubscribeEntries();
		if (this.unsubscribeSettings) this.unsubscribeSettings();
	}

	static getResultsFromEntries(entries: TimekeepRegistryEntry[]): TimekeepResult[] {
		const results: TimekeepResult[] = [];
		for (const entry of entries) {
			switch (entry.type) {
				case TimekeepEntryItemType.FILE: {
					const timekeep = entry.timekeep;
					results.push({ id: uuid(), file: entry.file, timekeep });
					break;
				}
				case TimekeepEntryItemType.MARKDOWN: {
					for (let i = 0; i < entry.timekeeps.length; i += 1) {
						const timekeepWithPosition = entry.timekeeps[i];
						const timekeep = timekeepWithPosition.timekeep;

						results.push({
							id: uuid(),
							file: entry.file,
							timekeep,
							index: i,
						});
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

		return results;
	}
}

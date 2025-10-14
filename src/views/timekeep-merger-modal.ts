import { Store } from "@/store";
import { v4 as uuid } from "uuid";
import { exportPdf } from "@/export/pdf";
import { TimekeepSettings } from "@/settings";
import { extractTimekeepCodeblocks } from "@/timekeep/parser";
import { Timekeep, stripTimekeepRuntimeData } from "@/timekeep/schema";
import { App, TFile, Modal, TextComponent, ButtonComponent } from "obsidian";

interface TimekeepResult {
	timekeep: Timekeep;
	file: TFile;
	index: number;
	id: string;
}

export class TimekeepMergerModal extends Modal {
	private results: TimekeepResult[] = [];
	private filteredResults: TimekeepResult[] = [];
	private selectedResults: TimekeepResult[] = [];

	private listContainer: HTMLElement | undefined;
	private searchInput: TextComponent | undefined;
	private selectAll: HTMLInputElement | undefined;
	private selectContainer: HTMLDivElement | undefined;
	private loadingEl: HTMLElement | undefined;
	private exportPdf: boolean;
	private settings: Store<TimekeepSettings>;

	constructor(
		app: App,
		settings: Store<TimekeepSettings>,
		exportPdf = false
	) {
		super(app);

		this.exportPdf = exportPdf;
		this.settings = settings;

		this.setTitle("Create merged timekeep" + (exportPdf ? " pdf" : ""));
	}

	async onOpen(): Promise<void> {
		this.contentEl.empty();
		this.contentEl.createEl("p", {
			text: "Select Timekeep Entries to Merge",
		});

		this.loadingEl = this.contentEl.createDiv({
			text: "Loading timekeep entries...",
		});
		this.loadingEl.style.marginBottom = "1rem";
		this.loadingEl.style.opacity = "0.7";

		this.searchInput = new TextComponent(this.contentEl);
		this.searchInput.setPlaceholder("Search by file path...");
		this.searchInput.inputEl.style.width = "100%";
		this.searchInput.setDisabled(true);
		this.searchInput.onChange(() => {
			this.updateFilteredResults();
			this.renderList();
			this.updateSelectAll();
		});

		const selectContainer = this.contentEl.createDiv();
		selectContainer.style.display = "none";
		selectContainer.style.flexDirection = "row";
		selectContainer.style.alignItems = "center";
		selectContainer.style.gap = "0.5rem";
		selectContainer.style.paddingLeft = "0.75rem";
		selectContainer.style.paddingTop = "1rem";
		selectContainer.style.fontWeight = "bold";
		this.selectContainer = selectContainer;

		const selectAll = selectContainer.createEl("input", {
			type: "checkbox",
		});
		selectAll.checked = this.isAllSelected();
		selectAll.id = `merge-select-all`;
		selectAll.onchange = () => {
			this.toggleSelectAll(selectAll.checked);
			this.renderList();
		};
		this.selectAll = selectAll;

		const selectAllLabel = selectContainer.createEl("label");
		selectAllLabel.htmlFor = "merge-select-all";
		selectAllLabel.textContent = "Select All";

		this.listContainer = this.contentEl.createDiv();
		this.listContainer.style.maxHeight = "400px";
		this.listContainer.style.overflowY = "auto";
		this.listContainer.style.marginTop = "0.25em";
		this.listContainer.style.padding = "0.25em";

		const footer = this.contentEl.createDiv();
		footer.style.display = "flex";
		footer.style.flexFlow = "row";
		footer.style.gap = "1rem";
		footer.style.marginTop = "0.5rem";

		const mergeButton = new ButtonComponent(footer)
			.setButtonText("Create")
			.setCta()
			.setDisabled(true)
			.onClick(() => {
				const timekeep: Timekeep = {
					entries: [],
				};

				for (const result of this.selectedResults) {
					timekeep.entries = [
						...timekeep.entries,
						...result.timekeep.entries,
					];
				}

				// Close after taking the results as closing resets the list
				this.close();

				if (this.exportPdf) {
					// Export a pdf
					exportPdf(timekeep, this.settings.getState());
				} else {
					// Insert into editor
					const editor = this.app.workspace.activeEditor?.editor;
					if (editor) {
						editor.replaceSelection(
							`\n\`\`\`timekeep\n${JSON.stringify(stripTimekeepRuntimeData(timekeep))}\n\`\`\`\n`
						);
					}
				}
			});

		new ButtonComponent(footer).setButtonText("Cancel").onClick(() => {
			this.close();
		});

		try {
			this.results = await this.getResults();

			this.updateFilteredResults();
			this.renderList();
			this.updateSelectAll();

			this.loadingEl.remove();
			mergeButton.setDisabled(false);
			this.searchInput.setDisabled(false);
		} catch (err) {
			console.error(err);
			this.loadingEl.setText("Failed to load timekeep entries.");
			this.loadingEl.style.opacity = "1";
		}
	}

	updateSelectAll() {
		if (this.selectContainer) {
			this.selectContainer.style.display =
				this.filteredResults.length > 0 ? "flex" : "none";
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
			const selected = this.selectedResults.find(
				(selected) => selected.id === result.id
			);

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
				const selected = this.selectedResults.find(
					(selected) => selected.id === result.id
				);
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
	}

	/**
	 * Update the current filtered results to match the
	 * search query
	 */
	updateFilteredResults() {
		if (!this.searchInput) return;

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
	 * Locate all timekeep codeblocks in files
	 */
	async getResults(): Promise<TimekeepResult[]> {
		const markdownFiles = this.app.vault.getMarkdownFiles();
		const batchSize = 25;

		const results: TimekeepResult[] = [];

		for (let i = 0; i < markdownFiles.length; i += batchSize) {
			const batch = markdownFiles.slice(i, i + batchSize);

			await Promise.allSettled(
				batch.map(async (file) => {
					const content = await this.app.vault.cachedRead(file);
					const codeblocks = extractTimekeepCodeblocks(content);

					for (let i = 0; i < codeblocks.length; i += 1) {
						results.push({
							timekeep: codeblocks[i],
							file,
							index: i,
							id: uuid(),
						});
					}
				})
			);
		}
		return results;
	}

	/**
	 * Render the list of filtered results
	 */
	private renderList() {
		if (!this.listContainer) {
			return;
		}

		this.listContainer.empty();
		for (const result of this.filteredResults) {
			const itemEl = this.listContainer.createEl("label", {
				cls: "timekeep-item",
			});
			itemEl.htmlFor = `timekeep-${result.id}`;
			itemEl.style.display = "flex";
			itemEl.style.alignItems = "center";
			itemEl.style.padding = "0.5em";
			itemEl.style.gap = "0.5em";

			const checkbox = itemEl.createEl("input", { type: "checkbox" });
			checkbox.style.marginRight = "0.5em";
			checkbox.checked =
				this.selectedResults.find((other) => other.id === result.id) !==
				undefined;
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

			const label = itemEl.createDiv();
			label.style.flexGrow = "1";
			label.style.display = "flex";
			label.style.flexFlow = "column";

			const title = label.createEl("span");
			title.textContent = `${result.file.basename}: Timekeep ${result.index + 1}`;

			const path = label.createEl("span");
			path.textContent = `${result.file.path}`;
			path.style.opacity = "0.7";
		}
	}

	onClose(): void {
		this.results = [];
		this.filteredResults = [];
		this.selectedResults = [];
		this.contentEl.empty();

		this.searchInput = undefined;
		this.listContainer = undefined;
		this.loadingEl = undefined;
		this.selectAll = undefined;
	}
}

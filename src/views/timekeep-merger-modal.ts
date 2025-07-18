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
		});

		this.listContainer = this.contentEl.createDiv();
		this.listContainer.style.maxHeight = "400px";
		this.listContainer.style.overflowY = "auto";
		this.listContainer.style.marginTop = "1em";
		this.listContainer.style.padding = "0.25em";

		const footer = this.contentEl.createDiv();
		footer.style.display = "flex";
		footer.style.flexFlow = "row";
		footer.style.gap = "1rem";
		footer.style.marginTop = "1rem";

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

			this.loadingEl.remove();
			mergeButton.setDisabled(false);
			this.searchInput.setDisabled(false);
		} catch (err) {
			console.error(err);
			this.loadingEl.setText("Failed to load timekeep entries.");
			this.loadingEl.style.opacity = "1";
		}
	}

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
	}
}

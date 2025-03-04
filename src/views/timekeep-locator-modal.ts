import { Timekeep, TimeEntry } from "@/schema";
import { App, TFile, SuggestModal } from "obsidian";
import { getRunningEntry, extractTimekeepCodeblocks } from "@/timekeep";

interface TimekeepResult {
	timekeep: Timekeep;
	running: TimeEntry;
	file: TFile;
}

export class TimekeepLocatorModal extends SuggestModal<TimekeepResult> {
	results: TimekeepResult[] | undefined = undefined;

	constructor(app: App) {
		super(app);
	}

	async getSuggestions(query: string): Promise<TimekeepResult[]> {
		if (this.results === undefined) {
			this.results = await this.getResults();
		}

		const queryLower = query.toLowerCase();

		return this.results.filter((result) => {
			return (
				result.running.name.toLowerCase().contains(queryLower) ||
				result.file.path.toLowerCase().contains(queryLower)
			);
		});
	}

	async getResults(): Promise<TimekeepResult[]> {
		const markdownFiles = this.app.vault.getMarkdownFiles();
		const batchSize = 10;

		const results: TimekeepResult[] = [];

		for (let i = 0; i < markdownFiles.length; i += batchSize) {
			const batch = markdownFiles.slice(i, i + batchSize);

			await Promise.allSettled(
				batch.map(async (file) => {
					const content = await this.app.vault.cachedRead(file);
					const timekeeps = extractTimekeepCodeblocks(content);
					console.log(timekeeps);

					for (const timekeep of timekeeps) {
						const running = getRunningEntry(timekeep.entries);
						if (running === null) continue;

						results.push({
							timekeep,
							running,
							file,
						});
					}
				})
			);
		}
		return results;
	}

	renderSuggestion(value: TimekeepResult, el: HTMLElement) {
		el.createEl("div", { text: value.running.name });
		el.createEl("small", { text: value.file.path });
	}

	onChooseSuggestion(item: TimekeepResult, _evt: MouseEvent | KeyboardEvent) {
		this.app.workspace.getLeaf().openFile(item.file);
	}
}

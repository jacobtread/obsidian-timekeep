import { CustomOutputFormat } from "@/output";
import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";
import { stripTimekeepRuntimeData, Timekeep } from "@/timekeep/schema";
import { Component, Notice, Platform } from "obsidian";
import moment from "moment";
import { createCSV, createMarkdownTable } from "@/export";
import { exportPdf } from "@/export/pdf";

/**
 * Export actions section component
 */
export class TimesheetExportActions extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;
	/** Additional custom output formats */
	customOutputFormats: Store<Record<string, CustomOutputFormat>>;

	/** Actions container element */
	#actionsEl: HTMLElement | undefined;
	/** Current loaded collection of custom output format buttons */
	#customOutputFormatButtons: HTMLButtonElement[] = [];

	constructor(
		containerEl: HTMLElement,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		customOutputFormats: Store<Record<string, CustomOutputFormat>>
	) {
		super();

		this.#containerEl = containerEl;

		this.timekeep = timekeep;
		this.settings = settings;
		this.customOutputFormats = customOutputFormats;
	}

	onload(): void {
		super.onload();

		const actionsEl = this.#containerEl.createEl("div", {
			cls: "timekeep-actions",
		});

		this.#actionsEl = actionsEl;

		const copyMarkdownButton = actionsEl.createEl("button", {
			text: "Copy Markdown",
		});

		const copyCSVButton = actionsEl.createEl("button", {
			text: "Copy CSV",
		});

		const copyJSONButton = actionsEl.createEl("button", {
			text: "Copy JSON",
		});

		const savePdfButton = actionsEl.createEl("button", {
			text: "Save PDF",
		});

		this.registerDomEvent(copyMarkdownButton, "click", this.onCopyMarkdown.bind(this));

		this.registerDomEvent(copyCSVButton, "click", this.onCopyCSV.bind(this));

		this.registerDomEvent(copyJSONButton, "click", this.onCopyJSON.bind(this));

		this.registerDomEvent(savePdfButton, "click", this.onSavePDF.bind(this));

		// Disable and hide the save as PDF button on mobile
		if (Platform.isMobileApp) {
			savePdfButton.disabled = true;
			savePdfButton.hidden = true;
		}

		const createCustomButtons = this.createCustomOutputFormatButtons.bind(this);
		const unsubscribeCustomFormats = this.customOutputFormats.subscribe(createCustomButtons);
		this.register(unsubscribeCustomFormats);
		createCustomButtons();
	}

	onunload(): void {
		super.onunload();
		this.#actionsEl?.remove();
	}

	removeCustomFormatButtons() {
		for (const button of this.#customOutputFormatButtons) {
			button.remove();
		}
	}

	createCustomOutputFormatButtons() {
		if (!this.#actionsEl) {
			return;
		}

		// Remove existing buttons
		this.removeCustomFormatButtons();

		const outputFormats = this.customOutputFormats.getState();

		for (const outputFormat of Object.values(outputFormats)) {
			const customFormatButton = this.#actionsEl.createEl("button", {
				text: outputFormat.getButtonLabel(),
			});

			this.registerDomEvent(customFormatButton, "click", () => {
				const timekeep = this.timekeep.getState();
				const settings = this.settings.getState();

				const currentTime = moment();
				outputFormat.onExport(timekeep, settings, currentTime);
			});

			this.#customOutputFormatButtons.push(customFormatButton);
		}
	}

	onCopyMarkdown() {
		const timekeep = this.timekeep.getState();
		const settings = this.settings.getState();

		const currentTime = moment();
		const output = createMarkdownTable(timekeep, settings, currentTime);

		navigator.clipboard
			.writeText(output)
			.then(() => new Notice("Copied markdown to clipboard", 1500))
			.catch((error) => console.error("Failed to copy export", error));
	}

	onCopyCSV() {
		const timekeep = this.timekeep.getState();
		const settings = this.settings.getState();

		const currentTime = moment();
		const output = createCSV(timekeep, settings, currentTime);

		navigator.clipboard
			.writeText(output)
			.then(() => new Notice("Copied CSV to clipboard", 1500))
			.catch((error) => console.error("Failed to copy export", error));
	}

	onCopyJSON() {
		const timekeep = this.timekeep.getState();
		const settings = this.settings.getState();

		const output = JSON.stringify(
			stripTimekeepRuntimeData(timekeep),
			undefined,
			settings.formatCopiedJSON ? 4 : undefined
		);

		navigator.clipboard
			.writeText(output)
			.then(() => new Notice("Copied JSON to clipboard", 1500))
			.catch((error) => console.error("Failed to copy export", error));
	}

	onSavePDF() {
		const timekeep = this.timekeep.getState();
		const settings = this.settings.getState();

		exportPdf(timekeep, settings);
	}
}

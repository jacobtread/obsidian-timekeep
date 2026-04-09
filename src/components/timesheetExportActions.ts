import moment from "moment";
import { type App, Notice } from "obsidian";

import type { CustomOutputFormat } from "@/output";
import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";

import { createCSV, createMarkdownTable } from "@/export";
import { exportPdf } from "@/export/pdf";
import { stripTimekeepRuntimeData, Timekeep } from "@/timekeep/schema";
import { assert } from "@/utils/assert";

import { DomComponent } from "./domComponent";

/**
 * Export actions section component
 */
export class TimesheetExportActions extends DomComponent {
	/** Access to the app instance */
	app: App;
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;
	/** Additional custom output formats */
	customOutputFormats: Store<Record<string, CustomOutputFormat>>;

	/** Current loaded collection of custom output format buttons */
	#customOutputFormatButtons: HTMLButtonElement[] = [];

	constructor(
		containerEl: HTMLElement,
		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		customOutputFormats: Store<Record<string, CustomOutputFormat>>
	) {
		super(containerEl);

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;
		this.customOutputFormats = customOutputFormats;
	}

	onload(): void {
		super.onload();

		const actionsEl = this.containerEl.createEl("div", {
			cls: "timekeep-actions",
		});

		this.wrapperEl = actionsEl;

		const copyMarkdownButton = actionsEl.createEl("button", {
			cls: "timekeep-export-button",
			text: "Copy Markdown",
			attr: {
				"data-format": "markdown",
			},
		});

		const copyCSVButton = actionsEl.createEl("button", {
			cls: "timekeep-export-button",
			text: "Copy CSV",
			attr: {
				"data-format": "csv",
			},
		});

		const copyJSONButton = actionsEl.createEl("button", {
			cls: "timekeep-export-button",
			text: "Copy JSON",
			attr: {
				"data-format": "json",
			},
		});

		const savePdfButton = actionsEl.createEl("button", {
			cls: "timekeep-export-button",
			text: "Save PDF",
			attr: {
				"data-format": "pdf",
			},
		});

		this.registerDomEvent(copyMarkdownButton, "click", this.onCopyMarkdown.bind(this));
		this.registerDomEvent(copyCSVButton, "click", this.onCopyCSV.bind(this));
		this.registerDomEvent(copyJSONButton, "click", this.onCopyJSON.bind(this));
		this.registerDomEvent(savePdfButton, "click", this.onSavePDF.bind(this));

		const createCustomButtons = this.createCustomOutputFormatButtons.bind(this);
		this.register(this.customOutputFormats.subscribe(createCustomButtons));
		createCustomButtons();
	}

	removeCustomFormatButtons() {
		for (const button of this.#customOutputFormatButtons) {
			button.remove();
		}
	}

	createCustomOutputFormatButtons() {
		assert(this.wrapperEl, "Wrapper element should be defined");

		// Remove existing buttons
		this.removeCustomFormatButtons();

		const outputFormats = this.customOutputFormats.getState();

		for (const [key, outputFormat] of Object.entries(outputFormats)) {
			const customFormatButton = this.wrapperEl.createEl("button", {
				cls: ["timekeep-export-button", "timekeep-export-button__custom"],
				text: outputFormat.getButtonLabel(),
				attr: {
					"data-custom-format": key,
				},
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

	async onCopyMarkdown() {
		const timekeep = this.timekeep.getState();
		const settings = this.settings.getState();

		const currentTime = moment();
		const output = createMarkdownTable(timekeep, settings, currentTime);

		try {
			await navigator.clipboard.writeText(output);
			new Notice("Copied markdown to clipboard", 1500);
		} catch (error) {
			console.error("Failed to copy export", error);
			new Notice("Failed to copy to clipboard", 1500);
		}
	}

	async onCopyCSV() {
		const timekeep = this.timekeep.getState();
		const settings = this.settings.getState();

		const currentTime = moment();
		const output = createCSV(timekeep, settings, currentTime);

		try {
			await navigator.clipboard.writeText(output);
			new Notice("Copied CSV to clipboard", 1500);
		} catch (error) {
			console.error("Failed to copy export", error);
			new Notice("Failed to copy to clipboard", 1500);
		}
	}

	async onCopyJSON() {
		const timekeep = this.timekeep.getState();
		const settings = this.settings.getState();

		const output = JSON.stringify(
			stripTimekeepRuntimeData(timekeep),
			undefined,
			settings.formatCopiedJSON ? 4 : undefined
		);

		try {
			await navigator.clipboard.writeText(output);
			new Notice("Copied JSON to clipboard", 1500);
		} catch (error) {
			console.error("Failed to copy export", error);
			new Notice("Failed to copy to clipboard", 1500);
		}
	}

	async onSavePDF() {
		const timekeep = this.timekeep.getState();
		const settings = this.settings.getState();

		try {
			await exportPdf(this.app, timekeep, settings);
		} catch (error) {
			console.error("Failed to export to PDF", error);
			new Notice("Failed to export to PDF", 1500);
		}
	}
}

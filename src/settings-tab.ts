import TimekeepPlugin from "@/main";
import { App, Setting, PluginSettingTab } from "obsidian";
import { defaultSettings, PdfExportBehavior } from "@/settings";

export class TimekeepSettingsTab extends PluginSettingTab {
	plugin: TimekeepPlugin;

	constructor(app: App, plugin: TimekeepPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();
		this.containerEl.createEl("h2", { text: "Settings" });

		const settings = this.plugin.settingsStore.getSettings();

		new Setting(this.containerEl)
			.setName("Timestamp display format")
			.setDesc(
				createFragment((f) => {
					f.createSpan({
						text: "The way that timestamps in time tracker tables should be displayed. Uses ",
					});
					f.createEl("a", {
						text: "moment.js",
						href: "https://momentjs.com/docs/#/parsing/string-format/",
					});
					f.createSpan({ text: " syntax." });
				})
			)
			.addText((t) => {
				t.setValue(String(settings.timestampFormat));
				t.onChange(async (v) => {
					// Only use a custom format if the value is not blank
					const newFormat = v.length
						? v
						: defaultSettings.timestampFormat;

					await this.plugin.updateSettings((currentValue) => ({
						...currentValue,
						timestampFormat: newFormat,
					}));
				});
			});

		new Setting(this.containerEl)
			.setName("PDF title")
			.setDesc("The title to include on generated PDFs")

			.addText((t) => {
				t.setValue(String(settings.pdfTitle));
				t.onChange(async (v) => {
					// Only use a custom format if the value is not blank
					const newPdfTitle = v.length ? v : defaultSettings.pdfTitle;

					await this.plugin.updateSettings((currentValue) => ({
						...currentValue,
						pdfTitle: newPdfTitle,
					}));
				});
			});

		new Setting(this.containerEl)
			.setName("PDF footnote")
			.setDesc("The footnote to include PDFs")

			.addTextArea((t) => {
				t.setValue(String(settings.pdfFootnote));
				t.onChange(async (v) => {
					// Only use a custom format if the value is not blank
					const newPdfFootnote = v.length
						? v
						: defaultSettings.pdfFootnote;

					await this.plugin.updateSettings((currentValue) => ({
						...currentValue,
						pdfFootnote: newPdfFootnote,
					}));
				});
			});

		new Setting(this.containerEl)
			.setName("PDF export behavior")
			.setDesc("What to do after a pdf file has been exported")

			.addDropdown((t) => {
				t.addOptions({
					[PdfExportBehavior.NONE]: "Do nothing",
					[PdfExportBehavior.OPEN_FILE]:
						"Open exported file with default app",
					[PdfExportBehavior.OPEN_PATH]:
						"Open directory containing the exported file",
				});
				t.setValue(String(settings.pdfExportBehavior));
				t.onChange(async (v) => {
					await this.plugin.updateSettings((currentValue) => ({
						...currentValue,
						pdfExportBehavior: v as PdfExportBehavior,
					}));
				});
			});

		new Setting(this.containerEl)
			.setName("Pdf date format")
			.setDesc(
				createFragment((f) => {
					f.createSpan({
						text: "The way the date at the top of the pdf is formatted. Uses ",
					});
					f.createEl("a", {
						text: "moment.js",
						href: "https://momentjs.com/docs/#/parsing/string-format/",
					});
					f.createSpan({ text: " syntax." });
				})
			)
			.addText((t) => {
				t.setValue(String(settings.pdfDateFormat));
				t.onChange(async (v) => {
					// Only use a custom format if the value is not blank
					const newPdfDateFormat = v.length
						? v
						: defaultSettings.pdfDateFormat;

					await this.plugin.updateSettings((currentValue) => ({
						...currentValue,
						pdfDateFormat: newPdfDateFormat,
					}));
				});
			});

		new Setting(this.containerEl)
			.setName("Pdf row date format")
			.setDesc(
				createFragment((f) => {
					f.createSpan({
						text: "The way the date for each row of the pdf is formatted. Uses ",
					});
					f.createEl("a", {
						text: "moment.js",
						href: "https://momentjs.com/docs/#/parsing/string-format/",
					});
					f.createSpan({ text: " syntax." });
				})
			)
			.addText((t) => {
				t.setValue(String(settings.pdfRowDateFormat));
				t.onChange(async (v) => {
					// Only use a custom format if the value is not blank
					const newPdfRowDateFormat = v.length
						? v
						: defaultSettings.pdfRowDateFormat;

					await this.plugin.updateSettings((currentValue) => ({
						...currentValue,
						pdfRowDateFormat: newPdfRowDateFormat,
					}));
				});
			});

		new Setting(this.containerEl)
			.setName("CSV heading row")
			.setDesc(
				"Whether to use the first row of generated CSV as a title row"
			)
			.addToggle((t) => {
				t.setValue(settings.csvTitle);
				t.onChange(async (v) => {
					await this.plugin.updateSettings((currentValue) => ({
						...currentValue,
						csvTitle: v,
					}));
				});
			});

		new Setting(this.containerEl)
			.setName("CSV delimiter")
			.setDesc(
				"The delimiter character that should be used when copying a tracker table as CSV. For example, some languages use a semicolon instead of a comma."
			)
			.addText((t) => {
				t.setValue(String(settings.csvDelimiter));
				t.onChange(async (v) => {
					const newCsvDelimiter = v.length
						? v
						: defaultSettings.csvDelimiter;

					await this.plugin.updateSettings((currentValue) => ({
						...currentValue,
						csvDelimiter: newCsvDelimiter,
					}));
				});
			});

		new Setting(this.containerEl)
			.setName("Show decimal hours")
			.setDesc(
				"Whether to show the shortened hour only durations under the current and total timers (12h 8m 39s would be shown as 12.14h)"
			)
			.addToggle((t) => {
				t.setValue(settings.showDecimalHours);
				t.onChange(async (v) => {
					await this.plugin.updateSettings((currentValue) => ({
						...currentValue,
						showDecimalHours: v,
					}));
				});
			});

		new Setting(this.containerEl)
			.setName("Display segments in reverse order")
			.setDesc(
				"Whether older tracker segments should be displayed towards the bottom of the tracker, rather than the top."
			)
			.addToggle((t) => {
				t.setValue(settings.reverseSegmentOrder);
				t.onChange(async (v) => {
					await this.plugin.updateSettings((currentValue) => ({
						...currentValue,
						reverseSegmentOrder: v,
					}));
				});
			});

		new Setting(this.containerEl)
			.setName("Limit table height")
			.setDesc(
				"Whether to limit the height of the table, will clamp the height and make the table scrollable"
			)
			.addToggle((t) => {
				t.setValue(settings.limitTableSize);
				t.onChange(async (v) => {
					await this.plugin.updateSettings((currentValue) => ({
						...currentValue,
						limitTableSize: v,
					}));
				});
			});
	}
}

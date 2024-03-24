import { App, PluginSettingTab, Setting } from "obsidian";
import { defaultSettings } from "@/settings";
import TimekeepPlugin from "@/main";

export class TimekeepSettingsTab extends PluginSettingTab {
	plugin: TimekeepPlugin;

	constructor(app: App, plugin: TimekeepPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();
		this.containerEl.createEl("h2", { text: "Timekeep Settings" });

		new Setting(this.containerEl)
			.setName("Timestamp Display Format")
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
				t.setValue(String(this.plugin.settings.timestampFormat));
				t.onChange(async (v) => {
					this.plugin.settings.timestampFormat = v.length
						? v
						: defaultSettings.timestampFormat;
					await this.plugin.saveSettings();
				});
			});
		new Setting(this.containerEl)
			.setName("PDF Title")
			.setDesc("The title to include on generated PDFs")

			.addText((t) => {
				t.setValue(String(this.plugin.settings.pdfTitle));
				t.onChange(async (v) => {
					this.plugin.settings.pdfTitle = v.length
						? v
						: defaultSettings.pdfTitle;
					await this.plugin.saveSettings();
				});
			});

		new Setting(this.containerEl)
			.setName("CSV Heading Row")
			.setDesc(
				"Whether to use the first row of generated CSV as a title row"
			)
			.addToggle((t) => {
				t.setValue(this.plugin.settings.csvTitle);
				t.onChange(async (v) => {
					this.plugin.settings.csvTitle = v;
					await this.plugin.saveSettings();
				});
			});

		new Setting(this.containerEl)
			.setName("CSV Delimiter")
			.setDesc(
				"The delimiter character that should be used when copying a tracker table as CSV. For example, some languages use a semicolon instead of a comma."
			)
			.addText((t) => {
				t.setValue(String(this.plugin.settings.csvDelimiter));
				t.onChange(async (v) => {
					this.plugin.settings.csvDelimiter = v.length
						? v
						: defaultSettings.csvDelimiter;
					await this.plugin.saveSettings();
				});
			});

		new Setting(this.containerEl)
			.setName("Timestamp Durations")
			.setDesc(
				"Whether durations should be displayed in a timestamp format (12:15:01) rather than the default duration format (12h 15m 1s)."
			)
			.addToggle((t) => {
				t.setValue(this.plugin.settings.timestampDurations);
				t.onChange(async (v) => {
					this.plugin.settings.timestampDurations = v;
					await this.plugin.saveSettings();
				});
			});

		new Setting(this.containerEl)
			.setName("Display Segments in Reverse Order")
			.setDesc(
				"Whether older tracker segments should be displayed towards the bottom of the tracker, rather than the top."
			)
			.addToggle((t) => {
				t.setValue(this.plugin.settings.reverseSegmentOrder);
				t.onChange(async (v) => {
					this.plugin.settings.reverseSegmentOrder = v;
					await this.plugin.saveSettings();
				});
			});
	}
}

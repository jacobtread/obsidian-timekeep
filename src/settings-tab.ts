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
		this.containerEl.createEl("h2", { text: "Settings" });

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
				t.setValue(String(this.plugin.settings.timestampFormat));
				t.onChange(async (v) => {
					this.plugin.settings.timestampFormat = v.length
						? v
						: defaultSettings.timestampFormat;
					await this.plugin.saveSettings();
				});
			});

		new Setting(this.containerEl)
			.setName("PDF title")
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
			.setName("PDF footnote")
			.setDesc("The footnote to include PDFs")

			.addTextArea((t) => {
				t.setValue(String(this.plugin.settings.pdfFootnote));
				t.onChange(async (v) => {
					this.plugin.settings.pdfFootnote = v.length
						? v
						: defaultSettings.pdfFootnote;
					await this.plugin.saveSettings();
				});
			});

		new Setting(this.containerEl)
			.setName("CSV heading row")
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
			.setName("CSV delimiter")
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
			.setName("Timestamp durations")
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
			.setName("Display segments in reverse order")
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

		new Setting(this.containerEl)
			.setName("Limit table height")
			.setDesc(
				"Whether to limit the height of the table, will clamp the height and make the table scrollable"
			)
			.addToggle((t) => {
				t.setValue(this.plugin.settings.limitTableSize);
				t.onChange(async (v) => {
					this.plugin.settings.limitTableSize = v;
					await this.plugin.saveSettings();
				});
			});
	}
}

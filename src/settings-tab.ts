import {
	type App,
	Setting,
	PluginSettingTab,
	SettingDefinitionItem,
	SettingDefinitionControl,
	SettingDefinitionPage,
} from "obsidian";

import type { Store } from "@/store";

import TimekeepPlugin from "@/main";
import {
	SortOrder,
	FontFamily,
	DurationFormat,
	UnstartedOrder,
	defaultSettings,
	TimekeepSettings,
	PdfExportBehavior,
} from "@/settings";

export class TimekeepSettingsTab extends PluginSettingTab {
	settingsStore: Store<TimekeepSettings>;

	constructor(app: App, plugin: TimekeepPlugin) {
		super(app, plugin);

		this.settingsStore = plugin.settingsStore;
	}

	/**
	 * Legacy display implementation used by obsidian versions <1.13.0 to display
	 * the settings menu, post 1.13.0 this is ignored, this function maps the modern
	 * settings definitions to the legacy components
	 */
	display(): void {
		this.containerEl.empty();

		const settings = this.settingsStore.getState();
		const definitions = this.getSettingDefinitions();

		for (const item of definitions) {
			if ("type" in item && item.type === "page") {
				this.displayPage(settings, item as SettingDefinitionPage<keyof TimekeepSettings>);
			} else if ("control" in item) {
				this.displaySettingControl(
					settings,
					item as SettingDefinitionControl<keyof TimekeepSettings>
				);
			}
		}
	}

	/**
	 * Display a settings group in a <1.13.0 version of obsidian. Takes the modern
	 * settings group definition and transforms it to match the legacy format
	 *
	 * @param settings The current settings data
	 * @param group The settings group definition
	 */
	displayPage(settings: TimekeepSettings, group: SettingDefinitionPage<keyof TimekeepSettings>) {
		if (group.name) {
			const setting = new Setting(this.containerEl).setName(group.name).setHeading();
			if ("desc" in group && typeof group.desc === "string") {
				setting.setDesc(group.desc);
			}
		}

		if (group.items) {
			for (const item of group.items) {
				if ("control" in item) {
					this.displaySettingControl(
						settings,
						item as SettingDefinitionControl<keyof TimekeepSettings>
					);
				}
			}
		}
	}

	/**
	 * Displays a settings control for a <1.13.0 version of obsidian. Takes the modern
	 * settings control definition and maps it for the legacy format
	 *
	 * @param settings The current settings data
	 * @param controlSetting The settings control definition
	 */
	displaySettingControl(
		settings: TimekeepSettings,
		controlSetting: SettingDefinitionControl<keyof TimekeepSettings>
	) {
		const setting = new Setting(this.containerEl);
		const { name, desc, control } = controlSetting;

		if (name) setting.setName(name);
		if (desc) setting.setDesc(desc);

		switch (control.type) {
			case "number":
				setting.addText((t) => {
					t.setValue(String(settings[control.key] as string));
					t.onChange((v) => {
						const value = Number(v);
						// Only use a custom format if the value is not blank
						const newValue =
							Number.isFinite(value) && Number.isSafeInteger(value)
								? v
								: (defaultSettings[control.key] as number);

						this.setControlValue(control.key, newValue);
					});
				});

			case "toggle":
				setting.addToggle((t) => {
					t.setValue(settings[control.key] as boolean);
					t.onChange((v) => {
						this.setControlValue(control.key, v);
					});
				});
				break;
			case "dropdown":
				setting.addDropdown((t) => {
					t.addOptions(control.options);
					t.setValue(String(settings[control.key] as string));
					t.onChange((v) => {
						this.setControlValue(control.key, v);
					});
				});
				break;
			case "folder":
			case "file":
			case "textarea":
			case "text":
				setting.addText((t) => {
					t.setValue(String(settings[control.key] as string));
					t.onChange((v) => {
						// Only use a custom format if the value is not blank
						const newValue = v.length ? v : (defaultSettings[control.key] as string);

						this.setControlValue(control.key, newValue);
					});
				});
				break;
			default:
				throw new Error("unsupported control type");
		}
	}

	setControlValue(key: string, value: unknown): void {
		this.settingsStore.setState((currentValue) => ({
			...currentValue,
			[key]: value,
		}));
	}

	getControlValue(key: string): unknown {
		const settings = this.getUntypedSettings();
		return settings[key];
	}

	getUntypedSettings() {
		const settings = this.settingsStore.getState();
		return settings as unknown as Record<string, unknown>;
	}

	getSettingDefinitions(): SettingDefinitionItem<keyof TimekeepSettings>[] {
		return [
			{
				name: "Timestamp display format",
				desc: createFragment((f) => {
					f.createSpan({
						text: "The way that timestamps in time tracker tables should be displayed. Uses ",
					});
					f.createEl("a", {
						text: "moment.js",
						href: "https://momentjs.com/docs/#/parsing/string-format/",
					});
					f.createSpan({ text: " syntax." });
				}),
				control: {
					key: "timestampFormat",
					type: "text",
					defaultValue: defaultSettings.timestampFormat,
				},
			},
			{
				name: "Primary duration format",
				desc: "Format to show durations for the current and total timers",
				control: {
					key: "primaryDurationFormat",
					type: "dropdown",
					options: {
						[DurationFormat.LONG]: "Long - Format including all units (1h 30m 25s)",
						[DurationFormat.SHORT]: "Short - Format just including hours (1.5h)",
						[DurationFormat.DECIMAL]: "Decimal - Short format without units (1.5)",
					},
					defaultValue: defaultSettings.primaryDurationFormat,
				},
			},
			{
				name: "Secondary duration format",
				desc: "Format to show durations for the current and total timers",
				control: {
					key: "secondaryDurationFormat",
					type: "dropdown",
					options: {
						[DurationFormat.LONG]: "Long - Format including all units (1h 30m 25s)",
						[DurationFormat.SHORT]: "Short - Format just including hours (1.5h)",
						[DurationFormat.DECIMAL]: "Decimal - Short format without units (1.5)",
						[DurationFormat.NONE]: "None - No time is displayed",
					},
					defaultValue: defaultSettings.secondaryDurationFormat,
				},
			},
			{
				name: "Sort order",
				desc: "How entries should be sorted both when viewing and exporting",
				control: {
					key: "sortOrder",
					type: "dropdown",
					options: {
						[SortOrder.INSERTION]:
							"Insertion - Don't sort, leave entries in the order they were created",
						[SortOrder.REVERSE_INSERTION]:
							"Reverse Insertion - Opposite order to how entries were inserted",
						[SortOrder.NEWEST_START]:
							"Newest First - Sort most recently started entries to the start",
						[SortOrder.OLDEST_START]:
							"Newest Last - Sort most recently started entries to the end",
					},
					defaultValue: defaultSettings.sortOrder,
				},
			},
			{
				name: "Unstarted sort order",
				desc: "Where in the order should unstarted entries be put (Only applied when using 'Newest First' or 'Newest Last' sort order)",
				control: {
					key: "unstartedOrder",
					type: "dropdown",
					options: {
						[UnstartedOrder.FIRST]:
							"First - Put non started entries at the top of the list",
						[UnstartedOrder.LAST]:
							"Last - Put non started entries at the bottom of the list",
					},
					defaultValue: defaultSettings.unstartedOrder,
				},
			},
			{
				name: "Limit table height",
				desc: "Whether to limit the height of the table, will clamp the height and make the table scrollable",
				control: {
					key: "limitTableSize",
					type: "toggle",
					defaultValue: defaultSettings.limitTableSize,
				},
			},
			// General Export settings section
			{
				type: "page",
				name: "Export",
				desc: "General non file format specific exporting options",
				items: [
					{
						name: "CSV/Markdown duration format",
						desc: "Format to show durations as when copying as CSV/Markdown",
						control: {
							key: "exportDurationFormat",
							type: "dropdown",
							options: {
								[DurationFormat.LONG]:
									"Long - Format including all units (1h 30m 25s)",
								[DurationFormat.SHORT]:
									"Short - Format just including hours (1.5h)",
								[DurationFormat.DECIMAL]:
									"Decimal - Short format without units (1.5)",
							},
							defaultValue: defaultSettings.exportDurationFormat,
						},
					},
				],
			},
			// PDF Export settings section
			{
				type: "page",
				name: "PDF Export",
				desc: " Options when exporting to PDF",
				items: [
					{
						name: "PDF title",
						desc: "The title to include on generated PDFs",
						control: {
							key: "pdfTitle",
							type: "text",
							defaultValue: defaultSettings.pdfTitle,
						},
					},
					{
						name: "PDF footnote",
						desc: "The footnote to include PDFs",
						control: {
							key: "pdfFootnote",
							type: "text",
							defaultValue: defaultSettings.pdfFootnote,
						},
					},
					{
						name: "PDF export behavior",
						desc: "What to do after a pdf file has been exported",
						control: {
							key: "pdfExportBehavior",
							type: "dropdown",
							options: {
								[PdfExportBehavior.NONE]: "Do nothing",
								[PdfExportBehavior.OPEN_FILE]:
									"Open exported file with default app",
								[PdfExportBehavior.OPEN_PATH]:
									"Open directory containing the exported file",
							},
							defaultValue: defaultSettings.pdfExportBehavior,
						},
					},
					{
						name: "Pdf date format",
						desc: createFragment((f) => {
							f.createSpan({
								text: "The way the date at the top of the pdf is formatted. Uses ",
							});
							f.createEl("a", {
								text: "moment.js",
								href: "https://momentjs.com/docs/#/parsing/string-format/",
							});
							f.createSpan({ text: " syntax." });
						}),
						control: {
							key: "pdfDateFormat",
							type: "text",
							defaultValue: defaultSettings.pdfDateFormat,
						},
					},
					{
						name: "Pdf row date format",
						desc: createFragment((f) => {
							f.createSpan({
								text: "The way the date for each row of the pdf is formatted. Uses ",
							});
							f.createEl("a", {
								text: "moment.js",
								href: "https://momentjs.com/docs/#/parsing/string-format/",
							});
							f.createSpan({ text: " syntax." });
						}),
						control: {
							key: "pdfRowDateFormat",
							type: "text",
							defaultValue: defaultSettings.pdfRowDateFormat,
						},
					},
					{
						name: "Pdf font family",
						desc: "Font family to use when exporting to pdf, the Rubik font family is recommended if you use Arabic characters",
						control: {
							key: "pdfFontFamily",
							type: "dropdown",
							options: {
								[FontFamily.ROBOTO]: "Roboto",
								[FontFamily.RUBIK]: "Rubik",
							},
							defaultValue: defaultSettings.pdfFontFamily,
						},
					},
					{
						name: "Pdf mobile exports folder",
						desc: "Where to store exported PDF files on mobile devices (The regular prompt doesn't work here)",
						control: {
							key: "pdfMobileExportsFolder",
							type: "text",
							defaultValue: defaultSettings.pdfMobileExportsFolder,
						},
					},
				],
			},
			// CSV Export settings section
			{
				type: "page",
				name: "CSV Export",
				desc: "Options when exporting to CSV",
				items: [
					{
						name: "CSV heading row",
						desc: "Whether to use the first row of generated CSV as a title row",
						control: {
							key: "csvTitle",
							type: "toggle",
							defaultValue: defaultSettings.csvTitle,
						},
					},
					{
						name: "CSV delimiter",
						desc: "The delimiter character that should be used when copying a tracker table as CSV. For example, some languages use a semicolon instead of a comma.",
						control: {
							key: "csvDelimiter",
							type: "text",
							defaultValue: defaultSettings.csvDelimiter,
						},
					},
				],
			},
			// JSON Export settings section
			{
				type: "page",
				name: "JSON Export",
				desc: "Options when exporting to JSON",
				items: [
					{
						name: "Format copied JSON",
						desc: "Whether to format the JSON contents before copying them to clipboard.",
						control: {
							key: "formatCopiedJSON",
							type: "toggle",
							defaultValue: defaultSettings.formatCopiedJSON,
						},
					},
				],
			},
			// Registry settings section
			{
				type: "page",
				name: "Registry",
				desc: "Timekeep uses an internal registry to track timekeep instances within your vault for functionality like autocomplete",
				items: [
					{
						name: "Enabled",
						desc: "Whether to enable the registry, this can be disabled to reduce memory usage if you don't need the features that depend on it.",
						control: {
							key: "registryEnabled",
							type: "toggle",
							defaultValue: defaultSettings.registryEnabled,
						},
					},
					{
						name: "Index concurrency",
						desc: "Maximum files to read concurrently on initialization (decrease this if you find you are lagging when opening your vault because of timekeep)",
						control: {
							key: "registryConcurrencyLimit",
							type: "number",
							defaultValue: defaultSettings.registryConcurrencyLimit,
							validate: (value) => {
								if (Number.isFinite(value) && Number.isSafeInteger(value)) return;
								return "Must be a valid integer";
							},
						},
					},
				],
			},
			// Status bar section
			{
				type: "page",
				name: "Status Bar",
				desc: "Timekeep can show status bar entries for running timers within your vault. This requires that the registry option above is enabled",
				items: [
					{
						name: "Enabled",
						desc: "Whether to enable status bar entries.",
						control: {
							key: "statusBarEnabled",
							type: "toggle",
							defaultValue: defaultSettings.statusBarEnabled,
						},
					},
					{
						name: "Show folder path",
						desc: 'Whether to include the folder path of the file in the status item (i.e "Path/To/Entry: Block 1: 3h 5min 30s").',
						control: {
							key: "statusBarShowFolderPath",
							type: "toggle",
							defaultValue: defaultSettings.statusBarShowFolderPath,
						},
					},
					{
						name: "Show non generic entry parent name",
						desc: 'Whether to include the name of the nearest of the parent entry for generic "Part 1" style entries (i.e if "Part 1" is running within "Example Entry" it will be displayed as "Example Entry / Part 1: 3h 5min 30s").',
						control: {
							key: "statusBarPreferNonGenericParent",
							type: "toggle",
							defaultValue: defaultSettings.statusBarPreferNonGenericParent,
						},
					},
					{
						name: "Open in new tab",
						desc: 'Whether to open the file in a new tab after clicking a status item").',
						control: {
							key: "statusBarItemOpenNewTab",
							type: "toggle",
							defaultValue: defaultSettings.statusBarItemOpenNewTab,
						},
					},
				],
			},
			// Autocomplete section
			{
				type: "page",
				name: "Autocomplete",
				desc: "Timekeep can autocomplete entry names from existing timekeeps. This requires that the registry option above is enabled",
				items: [
					{
						name: "Enabled",
						desc: "Whether to enable autocomplete.",
						control: {
							key: "autocompleteEnabled",
							type: "toggle",
							defaultValue: defaultSettings.autocompleteEnabled,
						},
					},
				],
			},
		];
	}
}

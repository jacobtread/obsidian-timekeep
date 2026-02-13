import moment, { Moment } from "moment";
import { Store, createStore } from "@/store";
import { TimekeepSettingsTab } from "@/settings-tab";
import { SortOrder, defaultSettings, TimekeepSettings } from "@/settings";
import {
	load,
	replaceTimekeepCodeblock,
	extractTimekeepCodeblocks,
} from "@/timekeep/parser";
import {
	isKeepRunning,
	isEntryRunning,
	getRunningEntry,
	getEntryDuration,
	getTotalDuration,
} from "@/timekeep";
import {
	Vault,
	TFile,
	Notice,
	Plugin,
	PluginManifest,
	App as ObsidianApp,
	MarkdownPostProcessorContext,
} from "obsidian";

import { CustomOutputFormat } from "./output";
import { Timekeep, TimeEntry } from "./timekeep/schema";
import { AutocompleteProvider } from "./utils/autocomplete";
import { stopAllTimekeeps } from "./commands/stopAllTimekeeps";
import { stopFileTimekeeps } from "./commands/stopFileTimekeeps";
import { TimekeepMergerModal } from "./views/timekeep-merger-modal";
import { TimekeepLocatorModal } from "./views/timekeep-locator-modal";
import { TimekeepMarkdownView } from "./views/timekeep-markdown-view";

export default class TimekeepPlugin extends Plugin {
	settingsStore: Store<TimekeepSettings>;
	customOutputFormats: Store<Record<string, CustomOutputFormat>>;

	replaceTimekeepCodeblock: (
		timekeep: Timekeep,
		content: string,
		lineStart: number,
		lineEnd: number
	) => string;
	extractTimekeepCodeblocks: (value: string) => Timekeep[];
	isKeepRunning: (timekeep: Timekeep) => boolean;
	isEntryRunning: (entry: TimeEntry) => boolean;
	getRunningEntry: (entries: TimeEntry[]) => TimeEntry | null;
	getEntryDuration: (entry: TimeEntry, currentTime: Moment) => number;
	getTotalDuration: (entries: TimeEntry[], currentTime: Moment) => number;
	stopAllTimekeeps: (vault: Vault, currentTime: Moment) => Promise<number>;
	stopFileTimekeeps: (
		vault: Vault,
		file: TFile,
		currentTime: Moment
	) => Promise<number>;

	autocomplete: AutocompleteProvider;

	constructor(app: ObsidianApp, manifest: PluginManifest) {
		super(app, manifest);

		const saveSettings = this.saveData.bind(this);

		const settingsStore = createStore(defaultSettings);
		const customOutputFormats = createStore({});

		this.autocomplete = new AutocompleteProvider();
		// TODO: Bind vault changes to handle refreshing the autocomplete provider

		// Subscribe to settings changes to save them
		settingsStore.subscribe(() => {
			const settings = settingsStore.getState();
			saveSettings(settings);
		});

		this.customOutputFormats = customOutputFormats;
		this.settingsStore = settingsStore;

		// Expose API functions
		this.replaceTimekeepCodeblock = replaceTimekeepCodeblock;
		this.extractTimekeepCodeblocks = extractTimekeepCodeblocks;
		this.isKeepRunning = isKeepRunning;
		this.isEntryRunning = isEntryRunning;
		this.getRunningEntry = getRunningEntry;
		this.getEntryDuration = getEntryDuration;
		this.getTotalDuration = getTotalDuration;
		this.stopAllTimekeeps = stopAllTimekeeps;
		this.stopFileTimekeeps = stopFileTimekeeps;
	}

	async onload(): Promise<void> {
		const loadedSettings: TimekeepSettings = Object.assign(
			{},
			defaultSettings,
			await this.loadData()
		);

		// Compatibility with old reverse segment order
		if (loadedSettings.reverseSegmentOrder) {
			delete loadedSettings.reverseSegmentOrder;
			loadedSettings.sortOrder = SortOrder.REVERSE_INSERTION;
		}

		// Load saved settings and combine with defaults
		this.settingsStore.setState(loadedSettings);

		this.addSettingTab(new TimekeepSettingsTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor(
			"timekeep",
			(
				source: string,
				el: HTMLElement,
				context: MarkdownPostProcessorContext
			) => {
				const loadResult = load(source);

				context.addChild(
					new TimekeepMarkdownView(
						el,
						this.app,
						this.settingsStore,
						this.customOutputFormats,
						this.autocomplete,
						context,
						loadResult
					)
				);
			}
		);

		this.addCommand({
			id: `insert`,
			name: `Insert Tracker`,
			editorCallback: (e) => {
				e.replaceSelection('\n```timekeep\n{"entries": []}\n```\n');
			},
		});

		this.addCommand({
			id: `find`,
			name: `Find running trackers`,
			callback: () => new TimekeepLocatorModal(this.app).open(),
		});

		this.addCommand({
			id: `create-merged`,
			name: `Create Merged Tracker`,
			callback: () =>
				new TimekeepMergerModal(
					this.app,
					this.settingsStore,
					false
				).open(),
		});

		this.addCommand({
			id: `export-merged-pdf`,
			name: `Export Merged Tracker PDF`,
			callback: () =>
				new TimekeepMergerModal(
					this.app,
					this.settingsStore,
					true
				).open(),
		});

		this.addCommand({
			id: `stop-all-timekeeps`,
			name: `Stop All Running Trackers`,
			callback: () => {
				const currentTime = moment();
				stopAllTimekeeps(this.app.vault, currentTime)
					.then((totalStopped) => {
						if (totalStopped < 1) {
							new Notice("Nothing to stop.", 1500);
							return;
						}

						new Notice(
							`Stopped ${totalStopped} tracker${totalStopped !== 1 ? "s" : ""}`,
							1500
						);
					})
					.catch((error) => {
						let errorMessage = "";
						if (error instanceof Error) {
							errorMessage = error.message;
						} else if (typeof error === "string") {
							errorMessage = error;
						} else {
							error = "Unknown error occurred";
						}

						new Notice(
							"Failed to stop timekeeps: " + errorMessage,
							1500
						);
					});
			},
		});

		this.addCommand({
			id: `stop-current-timekeeps`,
			name: `Stop All Running Trackers (Current File Only)`,
			callback: () => {
				const currentTime = moment();
				const currentFile =
					this.app.workspace.activeEditor?.file ?? null;

				if (currentFile === null) {
					new Notice("No active file detected", 1500);
					return;
				}

				stopFileTimekeeps(this.app.vault, currentFile, currentTime)
					.then((totalStopped) => {
						if (totalStopped < 1) {
							new Notice("Nothing to stop.", 1500);
							return;
						}

						new Notice(
							`Stopped ${totalStopped} tracker${totalStopped !== 1 ? "s" : ""}`,
							1500
						);
					})
					.catch((error) => {
						let errorMessage = "";
						if (error instanceof Error) {
							errorMessage = error.message;
						} else if (typeof error === "string") {
							errorMessage = error;
						} else {
							error = "Unknown error occurred";
						}

						new Notice(
							"Failed to stop timekeeps: " + errorMessage,
							1500
						);
					});
			},
		});
	}

	registerCustomOutputFormat(id: string, format: CustomOutputFormat) {
		this.customOutputFormats.setState((state) => {
			return {
				...state,
				[id]: format,
			};
		});
	}

	unregisterCustomOutputFormat(id: string) {
		this.customOutputFormats.setState((state) => {
			const newState = { ...state };
			delete newState[id];
			return newState;
		});
	}
}

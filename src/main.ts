import { Moment } from "moment";
import { TimekeepSettingsTab } from "@/settings-tab";
import { PluginManifest, App as ObsidianApp } from "obsidian";
import { defaultSettings, TimekeepSettings } from "@/settings";
import { Plugin, MarkdownPostProcessorContext } from "obsidian";
import {
	load,
	isKeepRunning,
	isEntryRunning,
	getRunningEntry,
	getEntryDuration,
	getTotalDuration,
	extractTimekeepCodeblocks,
} from "@/timekeep";

import { Timekeep, TimeEntry } from "./schema";
import { TimekeepMarkdownView } from "./views/timekeep-markdown-view";
import { SettingsStore, createSettingsStore } from "./store/settings-store";

export default class TimekeepPlugin extends Plugin {
	settingsStore: SettingsStore;

	extractTimekeepCodeblocks: (value: string) => Timekeep[];
	isKeepRunning: (timekeep: Timekeep) => boolean;
	isEntryRunning: (entry: TimeEntry) => boolean;
	getRunningEntry: (entries: TimeEntry[]) => TimeEntry | null;
	getEntryDuration: (entry: TimeEntry, currentTime: Moment) => number;
	getTotalDuration: (entries: TimeEntry[], currentTime: Moment) => number;

	constructor(app: ObsidianApp, manifest: PluginManifest) {
		super(app, manifest);

		// Expose API functions
		this.extractTimekeepCodeblocks = extractTimekeepCodeblocks;
		this.isKeepRunning = isKeepRunning;
		this.isEntryRunning = isEntryRunning;
		this.getRunningEntry = getRunningEntry;
		this.getEntryDuration = getEntryDuration;
		this.getTotalDuration = getTotalDuration;
	}

	async onload(): Promise<void> {
		await this.loadSettings();

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
	}

	async loadSettings(): Promise<void> {
		const settings = Object.assign(
			{},
			defaultSettings,
			await this.loadData()
		);

		this.settingsStore = createSettingsStore(settings);
	}

	async updateSettings(
		update: (currentValue: TimekeepSettings) => TimekeepSettings
	): Promise<void> {
		const newValue = update(this.settingsStore.getSettings());

		this.settingsStore.setSettings(newValue);

		await this.saveData(newValue);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settingsStore.getSettings());
	}
}

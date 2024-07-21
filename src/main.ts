import App from "@/App";
import moment, { Moment } from "moment";
import React, { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";
import { TimekeepSettingsTab } from "@/settings-tab";
import { PluginManifest, App as ObsidianApp } from "obsidian";
import { defaultSettings, TimekeepSettings } from "@/settings";
import {
	TFile,
	Plugin,
	TAbstractFile,
	MarkdownRenderChild,
	MarkdownPostProcessorContext,
} from "obsidian";
import {
	load,
	LoadResult,
	isKeepRunning,
	isEntryRunning,
	getRunningEntry,
	getEntryDuration,
	getTotalDuration,
	replaceTimekeepCodeblock,
	extractTimekeepCodeblocks,
} from "@/timekeep";

import { Timekeep, TimeEntry } from "./schema";
import { createTimekeepStore } from "./store/timekeep-store";
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
					new TimekeepComponent(
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

class TimekeepComponent extends MarkdownRenderChild {
	// Obsidian app instance
	app: ObsidianApp;
	// Timekeep settings store
	settingsStore: SettingsStore;
	// Markdown context for the current markdown block
	context: MarkdownPostProcessorContext;
	// Timekeep load result
	loadResult: LoadResult;
	// React root
	root: Root;
	// Path to the file the timekeep is within
	fileSourcePath: string;

	constructor(
		containerEl: HTMLElement,
		app: ObsidianApp,
		settingsStore: SettingsStore,
		context: MarkdownPostProcessorContext,
		loadResult: LoadResult
	) {
		super(containerEl);
		this.app = app;
		this.settingsStore = settingsStore;
		this.context = context;
		this.loadResult = loadResult;
		this.root = createRoot(containerEl);

		// Set initial file path
		this.fileSourcePath = context.sourcePath;
	}

	onload(): void {
		// Hook file renaming to update the file we are saving to if its renamed
		this.registerEvent(
			this.app.vault.on(
				"rename",
				(file: TAbstractFile, oldName: string) => {
					if (
						file instanceof TFile &&
						oldName == this.fileSourcePath
					) {
						this.fileSourcePath = file.path;
					}
				}
			)
		);

		// Render the react content
		if (this.loadResult.success) {
			const timekeep = this.loadResult.timekeep;

			// Create a store for the timekeep state
			const timekeepStore = createTimekeepStore(
				timekeep,
				this.trySave.bind(this)
			);

			this.root.render(
				React.createElement(
					StrictMode,
					{},
					React.createElement(App, {
						app: this.app,
						timekeepStore,
						settingsStore: this.settingsStore,
					})
				)
			);
		} else {
			this.root.render(
				React.createElement(
					"p",
					{ className: "timekeep-container" },
					"Failed to load timekeep: " + this.loadResult.error
				)
			);
		}
	}

	onunload(): void {
		this.root.unmount();
	}

	/**
	 * Attempts to save the file normally, if this fails it also attempts
	 * to save a fallback file
	 *
	 * @param timekeep
	 * @returns Promise of a boolean indicating weather the save was a success
	 */
	async trySave(timekeep: Timekeep): Promise<boolean> {
		try {
			await this.save(timekeep);

			return true;
		} catch (e) {
			console.error("Failed to save timekeep", e);

			try {
				this.saveFallback(timekeep);
			} catch (e) {
				console.error("Couldn't save timekeep fallback", e);
			}

			return false;
		}
	}

	/**
	 * Attempts to save the timekeep within the current file
	 *
	 * @param timekeep The new timekeep data to save
	 */
	async save(timekeep: Timekeep) {
		const sectionInfo = this.context.getSectionInfo(this.containerEl);

		// Ensure we actually have a section to write to
		if (sectionInfo === null)
			throw new Error("Section to write did not exist");

		const file = this.app.vault.getFileByPath(this.fileSourcePath);

		// Ensure the file still exists
		if (file === null) throw new Error("File no longer exists");

		// Replace the stored timekeep block with the new one
		await this.app.vault.process(file, (data) => {
			return replaceTimekeepCodeblock(
				timekeep,
				data,
				sectionInfo.lineStart,
				sectionInfo.lineEnd
			);
		});
	}

	/**
	 * Fallback saving incase writing back to the timekeep block fails,
	 * if writing back fails attempt to write to a backup temporary file
	 * using the current date time
	 *
	 * @param timekeep The timekeep to save
	 */
	async saveFallback(timekeep: Timekeep) {
		// Fallback incase of write failure, attempt to write to another file
		const backupFileName = `timekeep-write-backup-${moment().format("YYYY-MM-DD HH-mm-ss")}.json`;

		// Write to the backup file
		this.app.vault.create(backupFileName, JSON.stringify(timekeep));
	}
}

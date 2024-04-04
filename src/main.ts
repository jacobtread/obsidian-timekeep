import React, { StrictMode } from "react";
import {
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	Plugin,
	Vault,
} from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { TimekeepSettings, defaultSettings } from "@/settings";
import { TimekeepSettingsTab } from "@/settings-tab";
import { LoadResult, load, replaceTimekeepCodeblock } from "@/timekeep";
import App from "@/App";
import { Timekeep } from "./schema";
import moment from "moment";

export default class TimekeepPlugin extends Plugin {
	settings: TimekeepSettings;

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
						this.app.vault,
						this.settings,
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
				e.replaceSelection('```timekeep\n{"entries": []}\n```\n');
			},
		});
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			defaultSettings,
			await this.loadData()
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

class TimekeepComponent extends MarkdownRenderChild {
	// Vault for saving and loading files
	vault: Vault;
	// Timekeep settings
	settings: TimekeepSettings;
	// Markdown context for the current markdown block
	context: MarkdownPostProcessorContext;
	// Timekeep load result
	loadResult: LoadResult;
	// React root
	root: Root;

	constructor(
		containerEl: HTMLElement,
		vault: Vault,
		settings: TimekeepSettings,
		context: MarkdownPostProcessorContext,
		loadResult: LoadResult
	) {
		super(containerEl);
		this.vault = vault;
		this.settings = settings;
		this.context = context;
		this.loadResult = loadResult;
		this.root = createRoot(containerEl);
	}

	onload(): void {
		// Render the react content
		if (this.loadResult.success) {
			const timekeep = this.loadResult.timekeep;

			this.root.render(
				React.createElement(
					StrictMode,
					{},
					React.createElement(App, {
						initialState: timekeep,
						settings: this.settings,
						save: this.trySave.bind(this),
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

		const file = this.vault.getFileByPath(this.context.sourcePath);

		// Ensure the file still exists
		if (file === null) throw new Error("File no longer exists");

		// Replace the stored timekeep block with the new one
		await this.vault.process(file, (data) => {
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
		this.vault.create(backupFileName, JSON.stringify(timekeep));
	}
}

import App from "@/App";
import moment from "moment";
import { Timekeep } from "@/schema";
import React, { StrictMode } from "react";
import { Store, createStore } from "@/store";
import { App as ObsidianApp } from "obsidian";
import { TimekeepSettings } from "@/settings";
import { Root, createRoot } from "react-dom/client";
import { LoadResult, replaceTimekeepCodeblock } from "@/timekeep";
import {
	TFile,
	TAbstractFile,
	MarkdownRenderChild,
	MarkdownPostProcessorContext,
} from "obsidian";

export class TimekeepMarkdownView extends MarkdownRenderChild {
	// Obsidian app instance
	app: ObsidianApp;
	// Timekeep settings store
	settingsStore: Store<TimekeepSettings>;
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
		settingsStore: Store<TimekeepSettings>,
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

			const timekeepStore = createStore(timekeep);
			const saveErrorStore = createStore(false);

			const trySave = this.trySave.bind(this);

			const handleSaveTimekeep = async (timekeep: Timekeep) => {
				// Attempt to save the timekeep changes
				const result = await trySave(timekeep);

				const saveError = !result;

				// Update the save error state
				if (saveErrorStore.getState() !== saveError) {
					saveErrorStore.setState(saveError);
				}
			};

			// Subscribe to save when timekeep changes
			timekeepStore.subscribe(() => {
				handleSaveTimekeep(timekeepStore.getState());
			});

			this.root.render(
				React.createElement(
					StrictMode,
					{},
					React.createElement(App, {
						app: this.app,
						timekeepStore,
						saveErrorStore,
						settingsStore: this.settingsStore,
						handleSaveTimekeep,
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

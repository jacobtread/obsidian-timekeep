import React from "react";
import {
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	Plugin,
	TFile,
	Vault,
} from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { TimekeepSettings, defaultSettings } from "@/settings";
import { TimekeepSettingsTab } from "@/settings-tab";
import { LoadResult, load, replaceTimekeepCodeblock } from "@/timekeep";
import App from "@/App";
import { Timekeep } from "./schema";

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
			name: `Insert Timekeep`,
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
				React.createElement(App, {
					initialState: timekeep,
					settings: this.settings,
					save: this.save.bind(this),
				})
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

	async save(timekeep: Timekeep) {
		const sectionInfo = this.context.getSectionInfo(this.containerEl);

		// Ensure we actually have a section to write to
		if (sectionInfo === null) return;

		const file = this.vault.getAbstractFileByPath(
			this.context.sourcePath
		) as TFile | null;

		// Ensure the file still exists
		if (file === null) return;

		try {
			const content = await this.vault.read(file);

			const newContent = replaceTimekeepCodeblock(
				timekeep,
				content,
				sectionInfo.lineStart,
				sectionInfo.lineEnd
			);

			await this.vault.modify(file, newContent);
		} catch (e) {
			// TODO: ON WRITE FAILURE SAVE TO TEMP FILE
			console.error("Failed to save timekeep", e);
		}
	}
}

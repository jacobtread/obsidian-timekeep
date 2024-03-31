import React from "react";
import { MarkdownPostProcessorContext, Plugin, TFile, Vault } from "obsidian";
import { createRoot } from "react-dom/client";
import { TimekeepSettings, defaultSettings } from "@/settings";
import { TimekeepSettingsTab } from "@/settings-tab";
import { load, replaceTimekeepCodeblock } from "@/timekeep";
import App from "@/App";
import { Timekeep } from "./schema";

export default class TimekeepPlugin extends Plugin {
	settings: TimekeepSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new TimekeepSettingsTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor(
			"timekeep",
			renderTimekeep(this.app.vault, this.settings)
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

function renderTimekeep(vault: Vault, settings: TimekeepSettings) {
	return (
		source: string,
		el: HTMLElement,
		context: MarkdownPostProcessorContext
	) => {
		const save = async (timekeep: Timekeep) => {
			const sectionInfo = context.getSectionInfo(el);

			// Ensure we actually have a section to write to
			if (sectionInfo === null) return;

			const file = vault.getAbstractFileByPath(
				context.sourcePath
			) as TFile | null;

			// Ensure the file still exists
			if (file === null) return;

			try {
				const content = await vault.read(file);

				const newContent = replaceTimekeepCodeblock(
					timekeep,
					content,
					sectionInfo.lineStart,
					sectionInfo.lineEnd
				);

				await vault.modify(file, newContent);
			} catch (e) {
				// TODO: ON WRITE FAILURE SAVE TO TEMP FILE

				console.error("Failed to save timekeep", e);
			}
		};

		const loadResult = load(source);

		// Create the react root
		const reactWrapper = el.createDiv({});
		const root = createRoot(reactWrapper);

		// Render the react content
		if (loadResult.success) {
			const timekeep = loadResult.timekeep;

			root.render(
				React.createElement(App, {
					initialState: timekeep,
					settings,
					save,
				})
			);
		} else {
			root.render(
				React.createElement(
					"p",
					{ className: "timekeep-container" },
					"Failed to load timekeep: " + loadResult.error
				)
			);
		}
	};
}

import React from "react";
import { MarkdownPostProcessorContext, Plugin, TFile } from "obsidian";
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
			(
				source: string,
				el: HTMLElement,
				context: MarkdownPostProcessorContext
			) => {
				const reactWrapper = el.createDiv({});
				const root = createRoot(reactWrapper);

				const loadResult = load(source);

				if (loadResult.success) {
					const timekeep = loadResult.timekeep;

					const app = this.app;
					const fileName = context.sourcePath;

					const saveTimekeep = async (timekeep: Timekeep) => {
						const vault = app.vault;
						const sectionInfo = context.getSectionInfo(el);

						// Ensure we actually have a section to write to
						if (sectionInfo === null) return;

						const file = vault.getAbstractFileByPath(
							fileName
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
							console.error("Failed to save timekeep", e);
						}
					};

					root.render(
						React.createElement(App, {
							initialState: timekeep,
							settings: this.settings,
							save: saveTimekeep,
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

				const observer = new MutationObserver((_, observer) => {
					if (!reactWrapper.isConnected) {
						// Unmount the react component
						root.unmount();
						// Disconnect the observer
						observer.disconnect();
					}
				});

				// Observe the document for changes
				observer.observe(document.body, {
					childList: true,
					subtree: true,
				});
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

import { Plugin } from "obsidian";
import { TimekeepSettings, defaultSettings } from "./settings";
import { TimekeepSettingsTab } from "./settings-tab";
import { load } from "./timekeep";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

export default class TimekeepPlugin extends Plugin {
	settings: TimekeepSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new TimekeepSettingsTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor(
			"timekeep",
			(source, el, context) => {
				const reactWrapper = el.createDiv({});
				const root = createRoot(reactWrapper);

				const loadResult = load(source);

				if (loadResult.success) {
					const timekeep = loadResult.timekeep;

					root.render(
						React.createElement(App, {
							initialState: timekeep,
							saveDetails: {
								app: this.app,
								fileName: context.sourcePath,
								getSectionInfo: () =>
									context.getSectionInfo(el),
							},
							settings: this.settings,
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

import { Plugin } from "obsidian";
import { TimekeepSettings, defaultSettings } from "./settings";
import { SimpleTimeTrackerSettingsTab } from "./settings-tab";
import { load } from "./timekeep";
import Timesheet from "./components/Timesheet";
import React from "react";
import { createRoot } from "react-dom/client";
import { SettingsContext } from "./hooks/use-settings-context";

export default class SimpleTimeTrackerPlugin extends Plugin {
	settings: TimekeepSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new SimpleTimeTrackerSettingsTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor("timekeep", (s, e, i) => {
			const loadResult = load(s);

			if (loadResult.success) {
				const timekeep = loadResult.timekeep;

				const reactWrapper = e.createDiv({});
				const root = createRoot(reactWrapper);
				root.render(
					<SettingsContext.Provider value={this.settings}>
						<Timesheet
							initialState={timekeep}
							saveDetails={{
								app: this.app,
								fileName: i.sourcePath,
								getSectionInfo: () => i.getSectionInfo(e),
							}}
						/>
					</SettingsContext.Provider>,
				);
			}
		});

		this.addCommand({
			id: `insert`,
			name: `Insert Timekeep`,
			editorCallback: (e, _) => {
				e.replaceSelection("```timekeep\n```\n");
			},
		});
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			defaultSettings,
			await this.loadData(),
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

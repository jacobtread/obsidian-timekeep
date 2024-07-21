import React from "react";
import { App as ObsidianApp } from "obsidian";
import TimesheetStart from "@/components/TimesheetStart";
import TimesheetTable from "@/components/TimesheetTable";
import TimesheetCounters from "@/components/TimesheetCounters";
import TimesheetExportActions from "@/components/TimesheetExportActions";

import { AppContext } from "./contexts/use-app-context";
import TimesheetSaveError from "./components/TimesheetSaveError";
import { SettingsContext } from "./contexts/use-settings-context";
import { SettingsStore, useSettingsStore } from "./store/settings-store";
import {
	useSaveError,
	TimekeepStore,
	TimekeepStoreContext,
} from "./store/timekeep-store";

export type AppProps = {
	// Obsidian app for creating modals
	app: ObsidianApp;
	// Timekeep state store
	timekeepStore: TimekeepStore;
	// Timekeep settings store
	settingsStore: SettingsStore;
};

/**
 * Main app component, handles managing the app state and
 * providing the contexts.
 */
export default function App({ app, timekeepStore, settingsStore }: AppProps) {
	const settings = useSettingsStore(settingsStore);
	const saveError = useSaveError(timekeepStore);

	return (
		<AppContext.Provider value={app}>
			<SettingsContext.Provider value={settings}>
				<TimekeepStoreContext.Provider value={timekeepStore}>
					{saveError ? (
						// Error page when saving fails
						<TimesheetSaveError />
					) : (
						<div className="timekeep-container">
							<TimesheetCounters />
							<TimesheetStart />
							<TimesheetTable />
							<TimesheetExportActions />
						</div>
					)}
				</TimekeepStoreContext.Provider>
			</SettingsContext.Provider>
		</AppContext.Provider>
	);
}

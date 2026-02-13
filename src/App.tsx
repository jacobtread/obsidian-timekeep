import React from "react";
import { Store, useStore } from "@/store";
import { Timekeep } from "@/timekeep/schema";
import { App as ObsidianApp } from "obsidian";
import { TimekeepSettings } from "@/settings";
import { CustomOutputFormat } from "@/output";
import { AppContext } from "@/contexts/use-app-context";
import TimesheetStart from "@/components/TimesheetStart";
import TimesheetTable from "@/components/TimesheetTable";
import TimesheetCounters from "@/components/TimesheetCounters";
import TimesheetSaveError from "@/components/TimesheetSaveError";
import { SettingsContext } from "@/contexts/use-settings-context";
import { TimekeepStoreContext } from "@/contexts/use-timekeep-store";
import TimesheetExportActions from "@/components/TimesheetExportActions";

import { AutocompleteProvider } from "./utils/autocomplete";

export type AppProps = {
	// Obsidian app for creating modals
	app: ObsidianApp;
	// Timekeep state store
	timekeepStore: Store<Timekeep>;
	// Store for save error state
	saveErrorStore: Store<boolean>;
	// Timekeep settings store
	settingsStore: Store<TimekeepSettings>;
	// Custom output formats store
	customOutputFormats: Store<Record<string, CustomOutputFormat>>;
	// Callback to save the timekeep
	handleSaveTimekeep: (value: Timekeep) => Promise<void>;
	// Provider for autocomplete functionality
	autocomplete: AutocompleteProvider;
};

/**
 * Main app component, handles managing the app state and
 * providing the contexts.
 */
export default function App({
	app,
	timekeepStore,
	saveErrorStore,
	settingsStore,
	customOutputFormats,
	handleSaveTimekeep,
	autocomplete,
}: AppProps) {
	const settings = useStore(settingsStore);
	const customOutputFormatsState = useStore(customOutputFormats);
	const saveError = useStore(saveErrorStore);

	return (
		<AppContext.Provider value={app}>
			<SettingsContext.Provider value={settings}>
				<TimekeepStoreContext.Provider value={timekeepStore}>
					{saveError ? (
						// Error page when saving fails
						<TimesheetSaveError
							handleSaveTimekeep={handleSaveTimekeep}
						/>
					) : (
						<div className="timekeep-container">
							<TimesheetCounters />
							<TimesheetStart autocomplete={autocomplete} />
							<TimesheetTable />
							<TimesheetExportActions
								customOutputFormats={customOutputFormatsState}
							/>
						</div>
					)}
				</TimekeepStoreContext.Provider>
			</SettingsContext.Provider>
		</AppContext.Provider>
	);
}

import React, { SetStateAction, useCallback, useState } from "react";

import { Timekeep } from "@/schema";
import { SaveDetails, isKeepRunning, save } from "@/timekeep";
import { TimekeepSettings } from "@/settings";

import { SettingsContext } from "@/hooks/use-settings-context";
import { TimekeepContext } from "@/hooks/use-timekeep-context";

import TimesheetCounters from "@/components/TimesheetCounters";
import TimesheetStart from "@/components/TimesheetStart";
import TimesheetTable from "@/components/TimesheetTable";
import TimesheetExportActions from "@/components/TimesheetExportActions";

export type AppProps = {
	// Initial state loaded from the document
	initialState: Timekeep;
	// Details required for saving to the Vault
	saveDetails: SaveDetails;
	// The timekeep settings
	settings: TimekeepSettings;
};

/**
 * Main app component, handles managing the app state and
 * providing the contexts.
 *
 * Wraps the state updates for `setTimekeep` with logic that
 * saves the changes to the vault
 */
export default function App({ initialState, saveDetails, settings }: AppProps) {
	const [timekeep, setTimekeep] = useState(initialState);

	// Wrapper around setTimekeep state to save the file on changes
	const setTimekeepWrapper = useCallback(
		(value: SetStateAction<Timekeep>) => {
			setTimekeep((storedValue) => {
				const updatedValue =
					value instanceof Function ? value(storedValue) : value;
				save(updatedValue, saveDetails);
				return updatedValue;
			});
		},
		[setTimekeep]
	);

	return (
		<SettingsContext.Provider value={settings}>
			<TimekeepContext.Provider
				value={{
					timekeep,
					setTimekeep: setTimekeepWrapper,
					isTimekeepRunning: isKeepRunning(timekeep),
				}}>
				<div className="timekeep-container">
					<TimesheetCounters />
					<TimesheetStart />
					<TimesheetTable />
					<TimesheetExportActions />
				</div>
			</TimekeepContext.Provider>
		</SettingsContext.Provider>
	);
}

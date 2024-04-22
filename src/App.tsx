import { Timekeep } from "@/schema";
import { isKeepRunning } from "@/timekeep";
import { TimekeepSettings } from "@/settings";
import TimesheetStart from "@/components/TimesheetStart";
import TimesheetTable from "@/components/TimesheetTable";
import { SettingsContext } from "@/hooks/use-settings-context";
import { TimekeepContext } from "@/hooks/use-timekeep-context";
import TimesheetCounters from "@/components/TimesheetCounters";
import React, { useState, useCallback, SetStateAction } from "react";
import TimesheetExportActions from "@/components/TimesheetExportActions";

export type AppProps = {
	// Initial state loaded from the document
	initialState: Timekeep;
	// The timekeep settings
	settings: TimekeepSettings;
	// Function to save the timekeep data
	// eslint-disable-next-line no-unused-vars
	save: (timekeep: Timekeep) => Promise<boolean>;
};

/**
 * Main app component, handles managing the app state and
 * providing the contexts.
 *
 * Wraps the state updates for `setTimekeep` with logic that
 * saves the changes to the vault
 */
export default function App({ initialState, save, settings }: AppProps) {
	const [timekeep, setTimekeep] = useState(initialState);
	const [saveError, setSaveError] = useState(false);

	const trySave = (timekeep: Timekeep) => {
		save(timekeep).then((isSaved) => {
			setSaveError(!isSaved);
		});
	};

	// Wrapper around setTimekeep state to save the file on changes
	const setTimekeepWrapper = useCallback(
		(value: SetStateAction<Timekeep>) => {
			setTimekeep((storedValue) => {
				const updatedValue =
					value instanceof Function ? value(storedValue) : value;
				trySave(updatedValue);
				return updatedValue;
			});
		},
		[setTimekeep]
	);

	const onRetrySave = () => {
		trySave(timekeep);
	};

	const onClickCopy = () => {
		navigator.clipboard.writeText(JSON.stringify(timekeep));
	};

	// Saving error fallback screen
	if (saveError) {
		return (
			<div>
				<h1>Warning</h1>
				<p>Failed to save current timekeep</p>
				<p>
					Press "Retry" to try again or "Copy Timekeep" to copy a
					backup to clipboard, an automated backup JSON file will be
					generated in the root of this vault
				</p>
				<button onClick={onRetrySave}>Retry</button>

				<button onClick={onClickCopy}>Copy Timekeep</button>
			</div>
		);
	}

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

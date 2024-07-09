import { Timekeep } from "@/schema";
import { isKeepRunning } from "@/timekeep";
import { App as ObsidianApp } from "obsidian";
import TimesheetStart from "@/components/TimesheetStart";
import TimesheetTable from "@/components/TimesheetTable";
import TimesheetCounters from "@/components/TimesheetCounters";
import { SettingsContext } from "@/contexts/use-settings-context";
import { TimekeepContext } from "@/contexts/use-timekeep-context";
import React, { useState, useCallback, SetStateAction } from "react";
import TimesheetExportActions from "@/components/TimesheetExportActions";

import { ConfirmModal } from "./utils/confirm-modal";
import { AppContext } from "./contexts/use-app-context";
import { SettingsStore, useSettingsStore } from "./store/settings-store";

export type AppProps = {
	app: ObsidianApp;
	// Initial state loaded from the document
	initialState: Timekeep;
	// The timekeep settings
	settingsStore: SettingsStore;
	// Function to save the timekeep data
	save: (timekeep: Timekeep) => Promise<boolean>;
};

/**
 * Main app component, handles managing the app state and
 * providing the contexts.
 *
 * Wraps the state updates for `setTimekeep` with logic that
 * saves the changes to the vault
 */
export default function App({
	app,
	initialState,
	save,
	settingsStore,
}: AppProps) {
	const [timekeep, setTimekeep] = useState(initialState);
	const [saveError, setSaveError] = useState(false);
	const settings = useSettingsStore(settingsStore);

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

	const showConfirm = useCallback(
		(title: string, message: string): Promise<boolean> => {
			return new Promise((resolve) => {
				const modal = new ConfirmModal(app, message, resolve);
				modal.setTitle(title);
				modal.open();
			});
		},
		[app]
	);

	// Saving error fallback screen
	if (saveError) {
		return (
			<div className="timekeep-container">
				<div className="timekeep-error">
					<h1>Warning</h1>
					<p>Failed to save current timekeep</p>
					<p>
						Press "Retry" to try again or "Copy Timekeep" to copy a
						backup to clipboard, an automated backup JSON file will
						be generated in the root of this vault
					</p>
				</div>

				<div className="timekeep-actions">
					<button onClick={onRetrySave}>Retry</button>
					<button onClick={onClickCopy}>Copy Timekeep</button>
				</div>
			</div>
		);
	}

	return (
		<AppContext.Provider value={app}>
			<SettingsContext.Provider value={settings}>
				<TimekeepContext.Provider
					value={{
						timekeep,
						setTimekeep: setTimekeepWrapper,
						isTimekeepRunning: isKeepRunning(timekeep),
						showConfirm,
					}}>
					<div className="timekeep-container">
						<TimesheetCounters />
						<TimesheetStart />
						<TimesheetTable />
						<TimesheetExportActions />
					</div>
				</TimekeepContext.Provider>
			</SettingsContext.Provider>
		</AppContext.Provider>
	);
}

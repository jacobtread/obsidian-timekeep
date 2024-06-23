import { useState, useEffect } from "react";
import { TimekeepSettings } from "@/settings";

/**
 * Simple reactive store for storing the current settings
 * and allowing the app to subscribe to changes
 */
export type SettingsStore = {
	// Getter for the current value
	getSettings: () => TimekeepSettings;

	// Sets the current settings value and updates all subscribers
	setSettings: (value: TimekeepSettings) => void;

	// Allows subscribing to changes using a callback
	subscribe: (callback: VoidFunction) => void;
	// Allows unsubscribing from changes for the provided callback
	unsubscribe: (callback: VoidFunction) => void;
};

/**
 * Creates a new settings store with the provided initial value
 *
 * @param initialValue The initial value
 * @returns The created store
 */
export function createSettingsStore(
	initialValue: TimekeepSettings
): SettingsStore {
	const eventTarget = new EventTarget();
	const object = { settings: initialValue };

	const getSettings = () => object.settings;
	const setSettings = (value: TimekeepSettings) => {
		object.settings = value;
		eventTarget.dispatchEvent(new Event("stateChange"));
	};

	const subscribe = (callback: VoidFunction) =>
		eventTarget.addEventListener("stateChange", callback);

	const unsubscribe = (callback: VoidFunction) =>
		eventTarget.removeEventListener("stateChange", callback);

	return {
		getSettings,
		setSettings,
		subscribe,
		unsubscribe,
	};
}

/**
 * React hook to subscribe to a settings store. Will
 * trigger state updates and re-render when the settings
 * change
 *
 * @param store The settings store
 * @returns The settings store value
 */
export function useSettingsStore(store: SettingsStore) {
	const [state, setState] = useState(store.getSettings());

	useEffect(() => {
		const handleUpdate = () => {
			const value = store.getSettings();
			setState(value);
		};

		store.subscribe(handleUpdate);

		return () => {
			store.unsubscribe(handleUpdate);
		};
	}, [setState, store]);

	return state;
}

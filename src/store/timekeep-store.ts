import { Timekeep } from "@/schema";
import {
	useState,
	useEffect,
	useContext,
	createContext,
	SetStateAction,
} from "react";

export const TimekeepStoreContext = createContext<TimekeepStore>(null!);

export function useTimekeepStore(): TimekeepStore {
	return useContext(TimekeepStoreContext);
}

/**
 * Simple reactive store for storing the current settings
 * and allowing the app to subscribe to changes
 */
export type TimekeepStore = {
	// Getter for the current value
	getTimekeep: () => Timekeep;

	// Sets the current settings value and updates all subscribers
	setTimekeep: (value: SetStateAction<Timekeep>) => void;

	// Saves the provided timekeep state to the file
	saveTimekeep: (value: Timekeep) => void;

	// Save error state
	getSaveError: () => boolean;

	// Allows subscribing to changes using a callback
	subscribe: (callback: VoidFunction) => void;
	// Allows unsubscribing from changes for the provided callback
	unsubscribe: (callback: VoidFunction) => void;
};

type SaveFunction = (timekeep: Timekeep) => Promise<boolean>;

type TimekeepState = {
	timekeep: Timekeep;
	saveError: boolean;
};

/**
 * Creates a new timekeep store with the provided initial value
 *
 * @param initialValue The initial value
 * @returns The created store
 */
export function createTimekeepStore(
	initialValue: Timekeep, // Function to save the timekeep data
	save: SaveFunction
): TimekeepStore {
	const eventTarget = new EventTarget();
	const object: TimekeepState = { timekeep: initialValue, saveError: false };

	const getTimekeep = () => object.timekeep;
	const setTimekeep = (value: SetStateAction<Timekeep>) => {
		const newValue =
			value instanceof Function ? value(object.timekeep) : value;

		object.timekeep = newValue;
		eventTarget.dispatchEvent(new Event("stateChange"));

		// Save the updated timekeep
		saveTimekeep(newValue);
	};

	const getSaveError = () => object.saveError;

	const saveTimekeep = (value: Timekeep) => {
		// Try save save the  timekeep
		save(value).then((isSaved) => {
			const saveError = !isSaved;

			if (object.saveError !== saveError) {
				object.saveError = saveError;
				// Dispatch the state change
				eventTarget.dispatchEvent(new Event("stateChange"));
			}
		});
	};

	const subscribe = (callback: VoidFunction) =>
		eventTarget.addEventListener("stateChange", callback);

	const unsubscribe = (callback: VoidFunction) =>
		eventTarget.removeEventListener("stateChange", callback);

	return {
		getTimekeep,
		setTimekeep,
		saveTimekeep,
		getSaveError,
		subscribe,
		unsubscribe,
	};
}

/**
 * React hook to subscribe to the timekeep store. Will
 * trigger state updates and re-render when the timekeep
 * changes
 *
 * @param store The store to subscribe to
 * @returns The current timekeep value in the store
 */
export function useTimekeep(store: TimekeepStore) {
	const [state, setState] = useState(store.getTimekeep());

	// Effect to handle state updates
	useEffect(() => {
		const handleUpdate = () => {
			const value = store.getTimekeep();
			setState(value);
		};

		store.subscribe(handleUpdate);

		return () => {
			store.unsubscribe(handleUpdate);
		};
	}, [setState, store]);

	return state;
}

/**
 * React hook to subscribe to the timekeep store save
 * error state. Will trigger state updates and re-render
 * when the save error state changes
 *
 * @param store The store to subscribe to
 * @returns The current save error value in the store
 */
export function useSaveError(store: TimekeepStore) {
	const [saveError, setSaveError] = useState(store.getSaveError());

	// Effect to track the save error
	useEffect(() => {
		const handleUpdate = () => {
			const value = store.getSaveError();
			setSaveError(value);
		};

		store.subscribe(handleUpdate);

		return () => {
			store.unsubscribe(handleUpdate);
		};
	}, [setSaveError, store]);

	return saveError;
}

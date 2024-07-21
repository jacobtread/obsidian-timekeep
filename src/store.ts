import { useState, useEffect, SetStateAction } from "react";

export type Store<T> = {
	// Getter for the current value
	getState: () => T;
	// Sets the current store value and updates all subscribers
	setState: (value: SetStateAction<T>) => void;

	// Subscribe to state changes on this store
	subscribe: (callback: VoidFunction) => void;
	// Unsubscribe from a specific callback
	unsubscribe: (callback: VoidFunction) => void;
};

type StoreState<T> = {
	// The current state
	state: T;
	// Listeners to invoke when state changes
	listeners: VoidFunction[];
};

/**
 * Creates a new store
 *
 * @param initial The initial value of the store
 * @returns The created store
 */
export function createStore<T>(initial: T): Store<T> {
	const store: StoreState<T> = { state: initial, listeners: [] };

	const getState = () => store.state;

	const setState = (value: SetStateAction<T>) => {
		const newValue = value instanceof Function ? value(store.state) : value;

		store.state = newValue;

		// Execute all the listeners
		store.listeners.forEach((listener) => {
			listener();
		});
	};

	const subscribe = (callback: VoidFunction) => {
		store.listeners.push(callback);
	};

	const unsubscribe = (callback: VoidFunction) => {
		const index = store.listeners.indexOf(callback);
		if (index !== -1) {
			store.listeners.splice(index, 1);
		}
	};

	return {
		getState,
		setState,
		subscribe,
		unsubscribe,
	};
}

/**
 * Hook to use the value of a store, subscribes
 * to the store and updates the UI when the store
 * changes
 *
 * @param store The store to subscribe to
 * @returns The current value of the store
 */
export function useStore<T>(store: Store<T>) {
	const [state, setState] = useState(store.getState());

	// Effect to handle state updates
	useEffect(() => {
		const handleUpdate = () => {
			const value = store.getState();
			setState(value);
		};

		store.subscribe(handleUpdate);

		return () => {
			store.unsubscribe(handleUpdate);
		};
	}, [setState, store]);

	return state;
}

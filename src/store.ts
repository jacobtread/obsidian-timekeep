export type Store<T> = {
    // Getter for the current value
    getState: () => T;
    // Sets the current store value and updates all subscribers
    setState: (value: StateUpdate<T>) => void;

    // Subscribe to state changes on this store
    subscribe: (callback: VoidFunction) => Unsubscribe;
    // Unsubscribe from a specific callback
    unsubscribe: (callback: VoidFunction) => void;
};

type StateUpdate<T> = T | ((value: T) => T);

export type Unsubscribe = () => void;

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

    const setState = (value: StateUpdate<T>) => {
        const newValue = value instanceof Function ? value(store.state) : value;

        store.state = newValue;

        // Execute all the listeners
        store.listeners.forEach((listener) => {
            listener();
        });
    };

    const subscribe = (callback: VoidFunction) => {
        store.listeners.push(callback);

        return () => {
            unsubscribe(callback);
        };
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

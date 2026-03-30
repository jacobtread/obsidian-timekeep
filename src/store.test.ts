import { describe, it, expect, vi } from "vitest";

import { createStore, derived } from "./store";

describe("createStore", () => {
	it("initializes with the provided value", () => {
		const store = createStore(10);
		expect(store.getState()).toBe(10);
	});

	it("sets state directly", () => {
		const store = createStore(0);
		store.setState(5);
		expect(store.getState()).toBe(5);
	});

	it("sets state using updater function", () => {
		const store = createStore(2);
		store.setState((prev) => prev * 2);
		expect(store.getState()).toBe(4);
	});

	it("notifies subscribers on state change", () => {
		const store = createStore(0);
		const listener = vi.fn();

		store.subscribe(listener);
		store.setState(1);

		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("notifies all subscribers", () => {
		const store = createStore(0);
		const listener1 = vi.fn();
		const listener2 = vi.fn();

		store.subscribe(listener1);
		store.subscribe(listener2);

		store.setState(1);

		expect(listener1).toHaveBeenCalled();
		expect(listener2).toHaveBeenCalled();
	});

	it("unsubscribe removes listener", () => {
		const store = createStore(0);
		const listener = vi.fn();

		store.subscribe(listener);
		store.unsubscribe(listener);

		store.setState(1);

		expect(listener).not.toHaveBeenCalled();
	});

	it("unsubscribe function returned from subscribe works", () => {
		const store = createStore(0);
		const listener = vi.fn();

		const unsubscribe = store.subscribe(listener);
		unsubscribe();

		store.setState(1);

		expect(listener).not.toHaveBeenCalled();
	});

	it("does nothing when unsubscribing a non-existent listener", () => {
		const store = createStore(0);
		const listener = vi.fn();

		// Should not throw
		expect(() => store.unsubscribe(listener)).not.toThrow();
	});
});

describe("derived", () => {
	it("initializes with derived value", () => {
		const base = createStore(2);
		const doubled = derived(base, (v) => v * 2);

		expect(doubled.getState()).toBe(4);
	});

	it("updates when base store changes", () => {
		const base = createStore(2);
		const doubled = derived(base, (v) => v * 2);

		base.setState(3);

		expect(doubled.getState()).toBe(6);
	});

	it("notifies subscribers when derived value changes", () => {
		const base = createStore(1);
		const doubled = derived(base, (v) => v * 2);

		const listener = vi.fn();
		doubled.subscribe(listener);

		base.setState(2);

		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("works with complex derivations", () => {
		const base = createStore({ count: 1 });
		const derivedStore = derived(base, (v) => v.count + 10);

		expect(derivedStore.getState()).toBe(11);

		base.setState({ count: 5 });

		expect(derivedStore.getState()).toBe(15);
	});

	it("derived store can be independently subscribed to", () => {
		const base = createStore(1);
		const plusOne = derived(base, (v) => v + 1);

		const listener = vi.fn();
		plusOne.subscribe(listener);

		base.setState(2);

		expect(listener).toHaveBeenCalled();
	});
});

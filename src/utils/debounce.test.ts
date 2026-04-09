import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { debounced } from "./debounce";

describe("debounced", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should call the debounced function after the specified delay", () => {
		const callback = vi.fn();
		const debouncedFunction = debounced(callback, 1000);

		debouncedFunction("Hello");
		debouncedFunction("World");

		vi.advanceTimersByTime(1200);

		expect(callback).toHaveBeenCalledOnce();
		expect(callback).toHaveBeenCalledWith("World");
	});

	it("should not call the debounced function immediately", () => {
		const callback = vi.fn();
		const debouncedFunction = debounced(callback, 1000);

		debouncedFunction("First call");
		debouncedFunction("Second call");

		vi.advanceTimersByTime(500);

		expect(callback).not.toHaveBeenCalled();
	});

	it("should call the debounced function after the timeout period if no further calls occur", () => {
		const callback = vi.fn();
		const debouncedFunction = debounced(callback, 1000);

		debouncedFunction("Only this call");

		vi.advanceTimersByTime(1200);

		expect(callback).toHaveBeenCalledOnce();
		expect(callback).toHaveBeenCalledWith("Only this call");
	});

	it("should not call the debounced function multiple times for rapid calls", () => {
		const callback = vi.fn();
		const debouncedFunction = debounced(callback, 1000);

		debouncedFunction("A");
		debouncedFunction("B");
		debouncedFunction("C");
		debouncedFunction("D");
		debouncedFunction("E");

		vi.advanceTimersByTime(1200);

		expect(callback).toHaveBeenCalledOnce();
		expect(callback).toHaveBeenCalledWith("E");
	});
});

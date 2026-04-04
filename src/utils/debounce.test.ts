import { describe, it, expect, vi } from "vitest";

import { debounced } from "./debounce";

describe("debounced", () => {
	it("should call the debounced function after the specified delay", async () => {
		const callback = vi.fn();
		const debouncedFunction = debounced(callback, 1000);

		debouncedFunction("Hello");
		debouncedFunction("World");

		await new Promise((resolve) => setTimeout(resolve, 1200));

		expect(callback).toHaveBeenCalledOnce();
		expect(callback).toHaveBeenCalledWith("World");
	});

	it("should not call the debounced function immediately", async () => {
		const callback = vi.fn();
		const debouncedFunction = debounced(callback, 1000);

		debouncedFunction("First call");
		debouncedFunction("Second call");

		await new Promise((resolve) => setTimeout(resolve, 500));

		expect(callback).not.toHaveBeenCalled();
	});

	it("should call the debounced function after the timeout period if no further calls occur", async () => {
		const callback = vi.fn();
		const debouncedFunction = debounced(callback, 1000);

		debouncedFunction("Only this call");

		await new Promise((resolve) => setTimeout(resolve, 1200));

		expect(callback).toHaveBeenCalledOnce();
		expect(callback).toHaveBeenCalledWith("Only this call");
	});

	it("should not call the debounced function multiple times for rapid calls", async () => {
		const callback = vi.fn();
		const debouncedFunction = debounced(callback, 1000);

		debouncedFunction("A");
		debouncedFunction("B");
		debouncedFunction("C");
		debouncedFunction("D");
		debouncedFunction("E");

		await new Promise((resolve) => setTimeout(resolve, 1200));

		expect(callback).toHaveBeenCalledOnce();
		expect(callback).toHaveBeenCalledWith("E");
	});
});

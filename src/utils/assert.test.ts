import { describe, it, expect } from "vitest";

import { assert } from "./assert";

describe("assert", () => {
	it("does nothing when condition is true", () => {
		expect(() => assert(true)).not.toThrow();
	});

	it("throws when condition is false", () => {
		expect(() => assert(false)).toThrow("Assertion failed");
	});

	it("throws with a custom message", () => {
		expect(() => assert(false, "Custom error")).toThrow("Custom error");
	});

	it("treats truthy values as true", () => {
		expect(() => assert(1 as unknown as boolean)).not.toThrow();
		expect(() => assert("hello" as unknown as boolean)).not.toThrow();
		expect(() => assert({} as unknown as boolean)).not.toThrow();
	});

	it("treats falsy values as false", () => {
		expect(() => assert(0 as unknown as boolean)).toThrow();
		expect(() => assert("" as unknown as boolean)).toThrow();
		expect(() => assert(null as unknown as boolean)).toThrow();
		expect(() => assert(undefined as unknown as boolean)).toThrow();
	});
});

import { describe, it, expect } from "vitest";

import { isEmptyString } from "./text";

describe("isEmptyString", () => {
	it("returns true for an empty string", () => {
		expect(isEmptyString("")).toBe(true);
	});

	it("returns true for a string with only spaces", () => {
		expect(isEmptyString("   ")).toBe(true);
	});

	it("returns true for a string with only tabs and newlines", () => {
		expect(isEmptyString("\n\t")).toBe(true);
	});

	it("returns true for a string with mixed whitespace", () => {
		expect(isEmptyString("  \n\t  ")).toBe(true);
	});

	it("returns false for a non-empty string", () => {
		expect(isEmptyString("hello")).toBe(false);
	});

	it("returns false for a string with leading/trailing whitespace but content", () => {
		expect(isEmptyString("  hello  ")).toBe(false);
	});

	it("returns false for a string with internal whitespace and content", () => {
		expect(isEmptyString("  hello world  ")).toBe(false);
	});

	it("returns false for a single non-whitespace character", () => {
		expect(isEmptyString("a")).toBe(false);
	});

	it("handles unicode whitespace correctly", () => {
		expect(isEmptyString("\u00A0")).toBe(true); // non-breaking space
	});
});

import { describe, it, expect } from "vitest";

import { getErrorMessage } from "./error";

describe("getErrorMessage", () => {
	it("returns the message when error is an instance of Error", () => {
		const error = new Error("Something went wrong");
		expect(getErrorMessage(error)).toBe("Something went wrong");
	});

	it("returns the string when error is a string", () => {
		const error = "Simple error string";
		expect(getErrorMessage(error)).toBe("Simple error string");
	});

	it("returns fallback message when error is null", () => {
		expect(getErrorMessage(null)).toBe("Unknown error occurred");
	});

	it("returns fallback message when error is undefined", () => {
		expect(getErrorMessage(undefined)).toBe("Unknown error occurred");
	});

	it("returns fallback message when error is a number", () => {
		expect(getErrorMessage(404)).toBe("Unknown error occurred");
	});

	it("returns fallback message when error is an object", () => {
		expect(getErrorMessage({ message: "Not an Error instance" })).toBe(
			"Unknown error occurred"
		);
	});

	it("handles Error subclasses correctly", () => {
		class CustomError extends Error {}
		const error = new CustomError("Custom error message");

		expect(getErrorMessage(error)).toBe("Custom error message");
	});

	it("prioritizes instanceof Error over string-like objects", () => {
		const error = new Error("Real error");
		(error as any).toString = () => "Fake string";

		expect(getErrorMessage(error)).toBe("Real error");
	});
});

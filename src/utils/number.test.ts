import { isNumberText } from "./number";

describe("isNumberText", () => {
	it("empty string should not be treated as number text", () => {
		const input = "";
		const expected = false;

		const output = isNumberText(input);
		expect(output).toEqual(expected);
	});

	it("string with words should not be treated as number text", () => {
		const input = "Test";
		const expected = false;

		const output = isNumberText(input);
		expect(output).toEqual(expected);
	});

	it("string with words and numbers should not be treated as number text", () => {
		const input = "Test 123";
		const expected = false;

		const output = isNumberText(input);
		expect(output).toEqual(expected);
	});

	it("string starting with numbers and ending with words should not be treated as number text", () => {
		const input = "123 Test";
		const expected = false;

		const output = isNumberText(input);
		expect(output).toEqual(expected);
	});

	it("string only containing numbers should be treated as number text", () => {
		const input = "123";
		const expected = true;

		const output = isNumberText(input);
		expect(output).toEqual(expected);
	});
});

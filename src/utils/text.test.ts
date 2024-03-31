import { strHash } from "./text";

it("empty string should have hash of zero", () => {
	const input = "";
	const output = strHash(input);
	expect(output).toEqual(0);
});

it("Hashes should be equal for same string", () => {
	const left = "Test string";
	const right = "Test string";
	expect(strHash(left)).toBe(strHash(right));
});

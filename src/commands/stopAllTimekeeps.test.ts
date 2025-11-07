import moment from "moment";
import fs from "node:fs/promises";

import { MockVault } from "./__mocks__/obsidian";
import { stopAllTimekeeps } from "./stopAllTimekeeps";

describe("stopAllTimekeeps", () => {
	it("should stop nothing when no markdown files", async () => {
		const vault = new MockVault();
		const amount = await stopAllTimekeeps(
			vault.asVault(),
			moment("2025-11-07T00:31:03.714Z")
		);

		expect(amount).toBe(0);
	});

	it("should stop nothing when none of the markdown files contain a timekeep", async () => {
		const vault = new MockVault();

		vault.addFile("TEST_MARKDOWN_1.md", "");
		vault.addFile("TEST_MARKDOWN_2.md", "");
		vault.addFile("TEST_MARKDOWN_3.md", "");

		const amount = await stopAllTimekeeps(
			vault.asVault(),
			moment("2025-11-07T00:31:03.714Z")
		);

		expect(amount).toBe(0);
	});

	it("should stop one timekeep when one is running", async () => {
		const vault = new MockVault();
		const TEST_MARKDOWN_1 = await fs.readFile(
			"src/commands/__fixtures__/TEST_MARKDOWN_1.md",
			"utf-8"
		);
		const TEST_MARKDOWN_1_STOPPED = await fs.readFile(
			"src/commands/__fixtures__/TEST_MARKDOWN_1_STOPPED.md",
			"utf-8"
		);

		const TEST_MARKDOWN_3 = await fs.readFile(
			"src/commands/__fixtures__/TEST_MARKDOWN_3.md",
			"utf-8"
		);
		const TEST_MARKDOWN_3_STOPPED = await fs.readFile(
			"src/commands/__fixtures__/TEST_MARKDOWN_3_STOPPED.md",
			"utf-8"
		);

		const file1 = vault.addFile("TEST_MARKDOWN_1.md", TEST_MARKDOWN_1);
		const file2 = vault.addFile("TEST_MARKDOWN_2.md", TEST_MARKDOWN_3);
		const file3 = vault.addFile("TEST_MARKDOWN_3.md", TEST_MARKDOWN_3);

		const amount = await stopAllTimekeeps(
			vault.asVault(),
			moment("2025-11-07T00:31:03.714Z")
		);

		const output1 = await vault.read(file1);
		expect(output1).toEqual(TEST_MARKDOWN_1_STOPPED);

		const output2 = await vault.read(file2);
		expect(output2).toEqual(TEST_MARKDOWN_3_STOPPED);

		const output3 = await vault.read(file3);
		expect(output3).toEqual(TEST_MARKDOWN_3_STOPPED);

		expect(amount).toBe(1);
	});

	it("should stop multiple timekeeps when multiple are running", async () => {
		const vault = new MockVault();
		const TEST_MARKDOWN_1 = await fs.readFile(
			"src/commands/__fixtures__/TEST_MARKDOWN_1.md",
			"utf-8"
		);
		const TEST_MARKDOWN_1_STOPPED = await fs.readFile(
			"src/commands/__fixtures__/TEST_MARKDOWN_1_STOPPED.md",
			"utf-8"
		);
		const TEST_MARKDOWN_2 = await fs.readFile(
			"src/commands/__fixtures__/TEST_MARKDOWN_2.md",
			"utf-8"
		);
		const TEST_MARKDOWN_2_STOPPED = await fs.readFile(
			"src/commands/__fixtures__/TEST_MARKDOWN_2_STOPPED.md",
			"utf-8"
		);
		const TEST_MARKDOWN_3 = await fs.readFile(
			"src/commands/__fixtures__/TEST_MARKDOWN_3.md",
			"utf-8"
		);
		const TEST_MARKDOWN_3_STOPPED = await fs.readFile(
			"src/commands/__fixtures__/TEST_MARKDOWN_3_STOPPED.md",
			"utf-8"
		);

		const file1 = vault.addFile("TEST_MARKDOWN_1.md", TEST_MARKDOWN_1);
		const file2 = vault.addFile("TEST_MARKDOWN_2.md", TEST_MARKDOWN_2);
		const file3 = vault.addFile("TEST_MARKDOWN_3.md", TEST_MARKDOWN_3);

		const amount = await stopAllTimekeeps(
			vault.asVault(),
			moment("2025-11-07T00:31:03.714Z")
		);

		const output1 = await vault.read(file1);
		expect(output1).toEqual(TEST_MARKDOWN_1_STOPPED);

		const output2 = await vault.read(file2);
		expect(output2).toEqual(TEST_MARKDOWN_2_STOPPED);

		const output3 = await vault.read(file3);
		expect(output3).toEqual(TEST_MARKDOWN_3_STOPPED);

		expect(amount).toBe(3);
	});

	it("operation should fail if timekeep data changes before processing occurs", async () => {
		const vault = new MockVault();

		const TEST_MARKDOWN_2 = await fs.readFile(
			"src/commands/__fixtures__/TEST_MARKDOWN_2.md",
			"utf-8"
		);

		vault.addFile("TEST_MARKDOWN_2.md", TEST_MARKDOWN_2);

		// Give the valid value back the first time
		vault.read.mockReturnValueOnce(Promise.resolve(TEST_MARKDOWN_2));

		// Provide a different value for the second one
		vault.read.mockReturnValueOnce(Promise.resolve(""));

		await expect(
			stopAllTimekeeps(
				vault.asVault(),
				moment("2025-11-07T00:31:03.714Z")
			)
		).rejects.toThrow();
	});
});

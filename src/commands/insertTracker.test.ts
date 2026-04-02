import type { MarkdownView } from "obsidian";

import { describe, it, expect, vi } from "vitest";

import * as codeblock from "@/utils/codeblock";

import insertTracker from "./insertTracker";

const createCodeBlock = vi.spyOn(codeblock, "createCodeBlock");

describe("insertTracker", () => {
	it("calls createCodeBlock with expected arguments", () => {
		const mockEditor = { replaceSelection: vi.fn() } as any;
		const ctx = {} as MarkdownView;

		const command = insertTracker();
		const editorCallback = command.editorCallback!;
		editorCallback(mockEditor, ctx);

		expect(createCodeBlock).toHaveBeenCalledWith('{"entries":[]}', 1, 1);
	});

	it("calls editor.replaceSelection with the result of createCodeBlock", () => {
		const mockEditor = { replaceSelection: vi.fn() } as any;
		const ctx = {} as MarkdownView;

		const command = insertTracker();
		const editorCallback = command.editorCallback!;
		editorCallback(mockEditor, ctx);

		const expectedContent = createCodeBlock(`{"entries":[]}`, 1, 1);
		expect(mockEditor.replaceSelection).toHaveBeenCalledWith(expectedContent);
	});
});

// @vitest-environment happy-dom

import { App } from "obsidian";
import { describe, expect, it, vi } from "vitest";

import { MockNotice, MockPlatform } from "@/__mocks__/obsidian";
import { defaultSettings } from "@/settings";

import { exportPdf, desktopModuleLoader } from "./pdf";

import { FileNamePromptModal } from "@/modals/FileNamePromptModal";

import { Timekeep } from "@/timekeep/schema";

const createPdf = vi.hoisted(() => {
	return vi.fn().mockImplementation(() => {
		return {
			getBlob: vi.fn().mockResolvedValueOnce(new Blob([], { type: "application/pdf" })),
			getBuffer: vi.fn().mockResolvedValue(Buffer.from(new ArrayBuffer(0))),
		};
	});
});

vi.mock("pdfmake", () => {
	return {
		default: {
			addVirtualFileSystem: vi.fn(),
			addFonts: vi.fn(),
			createPdf,
		},
	};
});

describe("exportPdf", () => {
	it("exporting on mobile should export to blob", async () => {
		MockPlatform.isMobileApp = true;

		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue("test.pdf");

		const getAbstractFileByPath = vi.fn().mockReturnValue(null);
		const createFolder = vi.fn().mockResolvedValue(undefined);
		const createBinary = vi.fn().mockResolvedValue(undefined);

		const app = {
			vault: {
				getAbstractFileByPath,
				createFolder,
				createBinary,
			},
		} as any as App;
		const timekeep: Timekeep = { entries: [] };
		const settings = defaultSettings;

		await exportPdf(app, timekeep, settings);

		expect(createPdf).toHaveBeenCalled();
		expect(getAbstractFileByPath).toHaveBeenCalled();
		expect(createFolder).toHaveBeenCalled();
		expect(createBinary).toHaveBeenCalled();

		expect(MockNotice).toHaveBeenCalledWith("Saved exported PDF");
	});

	it("exporting on desktop should export to readable stream", async () => {
		MockPlatform.isMobileApp = false;
		const showSaveDialog = vi.fn();
		const showItemInFolder = vi.fn();
		const existsSync = vi.fn();
		const writeFile = vi.fn();
		const mkdir = vi.fn().mockResolvedValue(undefined);

		vi.spyOn(desktopModuleLoader, "importModule").mockImplementation((name) => {
			if (name === "electron") {
				return {
					remote: {
						dialog: { showSaveDialog },
						shell: { showItemInFolder },
					},
				};
			}

			if (name === "fs/promises") {
				return {
					mkdir,
					writeFile,
				};
			}

			if (name === "fs") {
				return {
					existsSync,
				};
			}

			if (name === "path") {
				const { normalize, dirname } = require("path");

				return {
					normalize,
					dirname,
				};
			}

			return {};
		});

		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue("test.pdf");

		const app = {} as any as App;
		const timekeep: Timekeep = { entries: [] };
		const settings = defaultSettings;

		showSaveDialog.mockResolvedValue({
			cancelled: false,
			filePath: "test/test.pdf",
		});

		await exportPdf(app, timekeep, settings);

		expect(createPdf).toHaveBeenCalled();
		expect(showSaveDialog).toHaveBeenCalled();

		existsSync.mockReturnValue(false);

		expect(existsSync).toHaveBeenCalledWith("test");
		expect(mkdir).toHaveBeenCalledWith("test");

		expect(writeFile).toHaveBeenCalled();

		expect(showItemInFolder).toHaveBeenCalled();

		expect(MockNotice).toHaveBeenCalledWith("Export successful", 1500);
	});
});

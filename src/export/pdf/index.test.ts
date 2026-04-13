// @vitest-environment happy-dom

import { App, TFolder } from "obsidian";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MockNotice, MockPlatform } from "@/__mocks__/obsidian";
import { defaultSettings, PdfExportBehavior, TimekeepSettings } from "@/settings";

import { exportPdf, desktopModuleLoader } from "./index";

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

const mockImportModule = () => {
	const showSaveDialog = vi.fn();
	const showItemInFolder = vi.fn();
	const openPath = vi.fn();
	const existsSync = vi.fn();
	const writeFile = vi.fn();
	const mkdir = vi.fn().mockResolvedValue(undefined);

	vi.spyOn(desktopModuleLoader, "importModule").mockImplementation((name) => {
		if (name === "electron") {
			return {
				remote: { dialog: { showSaveDialog }, shell: { showItemInFolder, openPath } },
			};
		}

		if (name === "fs/promises") {
			return { mkdir, writeFile };
		}

		if (name === "fs") {
			return { existsSync };
		}

		if (name === "path") {
			const { normalize, dirname } = require("path");
			return { normalize, dirname };
		}

		return {};
	});

	return {
		showSaveDialog,
		showItemInFolder,
		existsSync,
		writeFile,
		mkdir,
		openPath,
	};
};

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
	beforeEach(() => {
		vi.clearAllMocks();
		createPdf.mockClear();
	});

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

		expect(MockNotice).toHaveBeenCalledWith("PDF export successful", 1500);
	});

	it("exporting on mobile should do nothing if a path is not picked", async () => {
		MockPlatform.isMobileApp = true;

		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue(null);

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

		expect(createPdf).not.toHaveBeenCalled();
	});

	it("exporting on mobile should create a folder if its missing", async () => {
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

		getAbstractFileByPath.mockReturnValue(null);

		await exportPdf(app, timekeep, settings);

		expect(createFolder).toHaveBeenCalled();
		expect(MockNotice).toHaveBeenCalledWith("PDF export successful", 1500);
	});

	it("exporting on mobile should use an existing folder if present", async () => {
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

		getAbstractFileByPath.mockReturnValue({} as TFolder);

		await exportPdf(app, timekeep, settings);

		expect(createFolder).not.toHaveBeenCalled();
		expect(MockNotice).toHaveBeenCalledWith("PDF export successful", 1500);
	});

	it("exporting on desktop should export to readable stream", async () => {
		MockPlatform.isMobileApp = false;
		const { showSaveDialog, existsSync, showItemInFolder, writeFile } = mockImportModule();
		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue("test.pdf");

		const app = {} as any as App;
		const timekeep: Timekeep = { entries: [] };
		const settings = defaultSettings;

		showSaveDialog.mockResolvedValue({
			canceled: false,
			filePath: "test/test.pdf",
		});

		existsSync.mockReturnValue(true);

		await exportPdf(app, timekeep, settings);

		expect(createPdf).toHaveBeenCalled();
		expect(showSaveDialog).toHaveBeenCalled();
		expect(writeFile).toHaveBeenCalled();
		expect(showItemInFolder).toHaveBeenCalled();
		expect(MockNotice).toHaveBeenCalledWith("PDF export successful", 1500);
	});

	it("exporting on desktop should create the parent folder if it doesn't exist", async () => {
		MockPlatform.isMobileApp = false;
		const { showSaveDialog, existsSync, mkdir, showItemInFolder, writeFile } =
			mockImportModule();
		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue("test.pdf");

		const app = {} as any as App;
		const timekeep: Timekeep = { entries: [] };
		const settings = defaultSettings;

		showSaveDialog.mockResolvedValue({
			canceled: false,
			filePath: "test/test.pdf",
		});
		existsSync.mockReturnValue(false);

		await exportPdf(app, timekeep, settings);

		expect(createPdf).toHaveBeenCalled();
		expect(showSaveDialog).toHaveBeenCalled();

		expect(existsSync).toHaveBeenCalledWith("test");
		expect(mkdir).toHaveBeenCalledWith("test");

		expect(writeFile).toHaveBeenCalled();

		expect(showItemInFolder).toHaveBeenCalled();

		expect(MockNotice).toHaveBeenCalledWith("PDF export successful", 1500);
	});

	it("exporting on desktop not should create the parent folder if it already exists", async () => {
		MockPlatform.isMobileApp = false;
		const { showSaveDialog, existsSync, mkdir, showItemInFolder, writeFile } =
			mockImportModule();
		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue("test.pdf");

		const app = {} as any as App;
		const timekeep: Timekeep = { entries: [] };
		const settings = defaultSettings;

		showSaveDialog.mockResolvedValue({
			canceled: false,
			filePath: "test/test.pdf",
		});
		existsSync.mockReturnValue(true);

		await exportPdf(app, timekeep, settings);

		expect(createPdf).toHaveBeenCalled();
		expect(showSaveDialog).toHaveBeenCalled();

		expect(existsSync).toHaveBeenCalledWith("test");
		expect(mkdir).not.toHaveBeenCalled();

		expect(writeFile).toHaveBeenCalled();

		expect(showItemInFolder).toHaveBeenCalled();

		expect(MockNotice).toHaveBeenCalledWith("PDF export successful", 1500);
	});

	it("exporting on desktop should use showItemInFolder for OPEN_PATH setting", async () => {
		MockPlatform.isMobileApp = false;
		const { showSaveDialog, showItemInFolder } = mockImportModule();
		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue("test.pdf");

		const app = {} as any as App;
		const timekeep: Timekeep = { entries: [] };
		const settings: TimekeepSettings = {
			...defaultSettings,
			pdfExportBehavior: PdfExportBehavior.OPEN_PATH,
		};

		showSaveDialog.mockResolvedValue({
			canceled: false,
			filePath: "test/test.pdf",
		});

		await exportPdf(app, timekeep, settings);
		expect(showItemInFolder).toHaveBeenCalled();
	});

	it("exporting on desktop should use openPath for OPEN_FILE setting", async () => {
		MockPlatform.isMobileApp = false;
		const { showSaveDialog, openPath } = mockImportModule();
		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue("test.pdf");

		const app = {} as any as App;
		const timekeep: Timekeep = { entries: [] };
		const settings: TimekeepSettings = {
			...defaultSettings,
			pdfExportBehavior: PdfExportBehavior.OPEN_FILE,
		};

		showSaveDialog.mockResolvedValue({
			canceled: false,
			filePath: "test/test.pdf",
		});

		await exportPdf(app, timekeep, settings);
		expect(openPath).toHaveBeenCalled();
	});

	it("exporting on desktop should do nothing after export for NONE setting", async () => {
		MockPlatform.isMobileApp = false;
		const { showSaveDialog, openPath, showItemInFolder } = mockImportModule();
		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue("test.pdf");

		const app = {} as any as App;
		const timekeep: Timekeep = { entries: [] };
		const settings: TimekeepSettings = {
			...defaultSettings,
			pdfExportBehavior: PdfExportBehavior.NONE,
		};

		showSaveDialog.mockResolvedValue({
			canceled: false,
			filePath: "test/test.pdf",
		});

		await exportPdf(app, timekeep, settings);
		expect(openPath).not.toHaveBeenCalled();
		expect(showItemInFolder).not.toHaveBeenCalled();
	});

	it("exporting on desktop but cancelling the dialog should prevent the export", async () => {
		MockPlatform.isMobileApp = false;

		const { showSaveDialog } = mockImportModule();
		showSaveDialog.mockResolvedValue({ canceled: true, filePath: "" });
		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue("test.pdf");

		const app = {} as any as App;
		const timekeep: Timekeep = { entries: [] };
		const settings = defaultSettings;

		await exportPdf(app, timekeep, settings);

		expect(createPdf).not.toHaveBeenCalled();
	});

	it("exporting on desktop but with no path from the dialog should prevent the export", async () => {
		MockPlatform.isMobileApp = false;

		const { showSaveDialog } = mockImportModule();
		showSaveDialog.mockResolvedValue({ canceled: false });
		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue("test.pdf");

		const app = {} as any as App;
		const timekeep: Timekeep = { entries: [] };
		const settings = defaultSettings;

		await exportPdf(app, timekeep, settings);

		expect(createPdf).not.toHaveBeenCalled();
	});

	it("an error while exporting should log and show a message", async () => {
		MockPlatform.isMobileApp = false;
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

		const { showSaveDialog } = mockImportModule();
		showSaveDialog.mockRejectedValue(new Error("failed to write file"));
		vi.spyOn(FileNamePromptModal, "pick").mockResolvedValue("test.pdf");

		const app = {} as any as App;
		const timekeep: Timekeep = { entries: [] };
		const settings = defaultSettings;

		await exportPdf(app, timekeep, settings);

		expect(consoleError).toHaveBeenCalled();
		expect(MockNotice).toHaveBeenCalledWith("Failed to export PDF file");
	});
});

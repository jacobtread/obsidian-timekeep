// @vitest-environment happy-dom

import moment from "moment";
import { App } from "obsidian";
import { v4 } from "uuid";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { createMockContainer, MockNotice } from "@/__mocks__/obsidian";
import { createCSV, createMarkdownTable } from "@/export";
import * as exportPdf from "@/export/pdf";
import { CustomOutputFormat } from "@/output";
import { defaultSettings, TimekeepSettings } from "@/settings";
import { createStore, Store } from "@/store";
import { stripTimekeepRuntimeData, Timekeep } from "@/timekeep/schema";

import { TimesheetExportActions } from "./TimesheetExportActions";

describe("TimesheetExportActions", () => {
	let container: HTMLElement;
	let app: App;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let customOutputFormats: Store<Record<string, CustomOutputFormat>>;

	let writeText: Mock<(data: string) => Promise<void>>;

	beforeEach(() => {
		container = createMockContainer();
		app = {} as App;
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);
		customOutputFormats = createStore({});

		writeText = vi.fn().mockResolvedValue(undefined);

		// Mock the clipboard
		Object.defineProperty(globalThis.navigator, "clipboard", {
			configurable: true,
			value: {
				writeText,
			},
		});
	});

	it("should load without errors", () => {
		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		expect(() => component.load()).not.toThrow();
	});

	it("changing the custom output formats should create new buttons", () => {
		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		customOutputFormats.setState({
			custom: {
				getButtonLabel() {
					return "Custom Format";
				},

				onExport() {},
			},
		});

		const button = container.querySelector(
			'.timekeep-export-button__custom[data-custom-format="custom"]'
		);
		expect(button).toBeInstanceOf(HTMLButtonElement);
	});

	it("changing the custom output formats twice should create new buttons and remove the old", () => {
		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		customOutputFormats.setState({
			custom: {
				getButtonLabel() {
					return "Custom Format";
				},

				onExport() {},
			},
		});

		const removeChild = vi.spyOn(component.wrapperEl!, "removeChild");
		const button = container.querySelector(
			'.timekeep-export-button__custom[data-custom-format="custom"]'
		);
		expect(button).toBeInstanceOf(HTMLButtonElement);

		customOutputFormats.setState({
			custom_v2: {
				getButtonLabel() {
					return "Custom V2";
				},

				onExport() {},
			},
		});

		expect(removeChild).toHaveBeenCalled();

		const oldButton = container.querySelector(
			'.timekeep-export-button__custom[data-custom-format="custom"]'
		);
		expect(oldButton).toBeNull();

		const newButton = container.querySelector(
			'.timekeep-export-button__custom[data-custom-format="custom_v2"]'
		);
		expect(newButton).toBeInstanceOf(HTMLButtonElement);
	});

	it("clicking a output format button should run the onExport callback", () => {
		const systemTime = moment();

		vi.useFakeTimers();
		vi.setSystemTime(systemTime.toDate());

		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		const onExport = vi.fn();

		customOutputFormats.setState({
			custom: {
				getButtonLabel() {
					return "Custom Format";
				},

				onExport,
			},
		});

		const button = container.querySelector(
			'.timekeep-export-button__custom[data-custom-format="custom"]'
		);
		expect(button).toBeInstanceOf(HTMLButtonElement);

		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		button!.dispatchEvent(event);

		expect(onExport).toHaveBeenCalledExactlyOnceWith(
			timekeep.getState(),
			settings.getState(),
			systemTime
		);
	});

	it("clicking the copy markdown button should copy the text as markdown", () => {
		const systemTime = moment();

		writeText.mockResolvedValue(null!);

		vi.setSystemTime(systemTime.toDate());

		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: moment(systemTime),
					endTime: null,
					subEntries: null,
				},
			],
		});

		const markdown = createMarkdownTable(timekeep.getState(), settings.getState(), systemTime);

		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		const onCopyMarkdown = vi.spyOn(component, "onCopyMarkdown");
		component.load();

		const button = container.querySelector('.timekeep-export-button[data-format="markdown"]');
		expect(button).toBeInstanceOf(HTMLButtonElement);

		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		button!.dispatchEvent(event);

		vi.runAllTicks();

		expect(onCopyMarkdown).toHaveBeenCalledOnce();
		expect(writeText).toHaveBeenCalledExactlyOnceWith(markdown);

		vi.runAllTicks();
	});

	it("onCopyMarkdown should copy the timekeep exported data as markdown", async () => {
		const systemTime = moment();
		writeText.mockResolvedValue(undefined);

		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: moment(systemTime),
					endTime: moment(systemTime).add(1, "h"),
					subEntries: null,
				},
			],
		});

		const markdown = createMarkdownTable(timekeep.getState(), settings.getState(), systemTime);

		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		await component.onCopyMarkdown();

		expect(writeText).toHaveBeenCalledExactlyOnceWith(markdown);
		expect(MockNotice).toHaveBeenLastCalledWith("Copied markdown to clipboard", 1500);
	});

	it("onCopyMarkdown should show a notice on error", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		writeText.mockRejectedValue(new Error("test error"));

		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		await component.onCopyMarkdown();

		expect(MockNotice).toHaveBeenLastCalledWith("Failed to copy to clipboard", 1500);
		expect(consoleError).toHaveBeenCalled();
	});

	it("onCopyCSV should copy the timekeep exported data as CSV", async () => {
		const systemTime = moment();
		writeText.mockResolvedValue(undefined);

		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: moment(systemTime),
					endTime: moment(systemTime).add(1, "h"),
					subEntries: null,
				},
			],
		});

		const csv = createCSV(timekeep.getState(), settings.getState(), systemTime);

		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		await component.onCopyCSV();

		expect(writeText).toHaveBeenCalledExactlyOnceWith(csv);
		expect(MockNotice).toHaveBeenLastCalledWith("Copied CSV to clipboard", 1500);
	});

	it("onCopyCSV should show a notice on error", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		writeText.mockRejectedValue(new Error("test error"));

		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		await component.onCopyCSV();

		expect(MockNotice).toHaveBeenLastCalledWith("Failed to copy to clipboard", 1500);
		expect(consoleError).toHaveBeenCalled();
	});

	it("onCopyJSON should copy the timekeep exported data as minified JSON with default settings", async () => {
		const systemTime = moment();
		writeText.mockResolvedValue(undefined);

		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: moment(systemTime),
					endTime: moment(systemTime).add(1, "h"),
					subEntries: null,
				},
			],
		});

		const timekeepData = timekeep.getState();
		const settingsData = settings.getState();

		const json = JSON.stringify(
			stripTimekeepRuntimeData(timekeepData),
			undefined,
			settingsData.formatCopiedJSON ? 4 : undefined
		);

		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		await component.onCopyJSON();

		expect(writeText).toHaveBeenCalledExactlyOnceWith(json);
		expect(MockNotice).toHaveBeenLastCalledWith("Copied JSON to clipboard", 1500);
	});
	it("onCopyJSON should copy the timekeep exported data as formatted JSON when formatCopiedJSON is enabled", async () => {
		const systemTime = moment();
		writeText.mockResolvedValue(undefined);

		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: moment(systemTime),
					endTime: moment(systemTime).add(1, "h"),
					subEntries: null,
				},
			],
		});

		settings.setState({ ...defaultSettings, formatCopiedJSON: true });

		const timekeepData = timekeep.getState();
		const settingsData = settings.getState();

		const json = JSON.stringify(
			stripTimekeepRuntimeData(timekeepData),
			undefined,
			settingsData.formatCopiedJSON ? 4 : undefined
		);

		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		await component.onCopyJSON();

		expect(writeText).toHaveBeenCalledExactlyOnceWith(json);
		expect(MockNotice).toHaveBeenLastCalledWith("Copied JSON to clipboard", 1500);
	});

	it("onCopyJSON should show a notice on error", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		writeText.mockRejectedValue(new Error("test error"));

		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		await component.onCopyJSON();

		expect(MockNotice).toHaveBeenLastCalledWith("Failed to copy to clipboard", 1500);
		expect(consoleError).toHaveBeenCalled();
	});

	it("onSavePDF should attempt a pdf export", async () => {
		const exportPdfSpy = vi.spyOn(exportPdf, "exportPdf").mockResolvedValue(undefined);

		const systemTime = moment();
		writeText.mockResolvedValue(undefined);

		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: moment(systemTime),
					endTime: moment(systemTime).add(1, "h"),
					subEntries: null,
				},
			],
		});

		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		await component.onSavePDF();

		expect(exportPdfSpy).toHaveBeenCalledOnce();
	});

	it("onSavePDF should show a notice on error", async () => {
		const exportPdfSpy = vi
			.spyOn(exportPdf, "exportPdf")
			.mockRejectedValue(new Error("test error"));
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

		const component = new TimesheetExportActions(
			container,
			app,
			timekeep,
			settings,
			customOutputFormats
		);

		component.load();

		await component.onSavePDF();

		expect(MockNotice).toHaveBeenLastCalledWith("Failed to export to PDF", 1500);
		expect(consoleError).toHaveBeenCalled();
		expect(exportPdfSpy).toHaveBeenCalled();
	});
});

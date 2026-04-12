// @vitest-environment happy-dom

import type { App } from "obsidian";

import moment from "moment";
import { v4 } from "uuid";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings, TimekeepSettings } from "@/settings";
import { createStore, type Store } from "@/store";

import { TimesheetRow } from "./TimesheetRow";
import { TimesheetRowContent } from "./TimesheetRowContent";
import { TimesheetRowContentEditing } from "./TimesheetRowContentEditing";

import type { TimeEntry, Timekeep } from "@/timekeep/schema";

describe("TimesheetRowContainer", () => {
	let containerEl: HTMLElement;
	let app: App;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let component: TimesheetRow;

	const start = moment();
	const entry: TimeEntry = {
		id: v4(),
		name: "Test",
		startTime: moment(start),
		endTime: null,
		subEntries: null,
	};

	beforeEach(() => {
		containerEl = createMockContainer();
		app = {} as App;
		timekeep = createStore<Timekeep>({ entries: [entry] });
		settings = createStore(defaultSettings);
		component = new TimesheetRow(containerEl, app, timekeep, settings, entry, 0);
	});

	it("should load without error", () => {
		expect(() => component.load()).not.toThrow();
	});

	it("should be able to switch to the editing view", () => {
		const onViewEditing = vi.spyOn(component, "onViewContent");

		component.load();

		const content = component.getContent() as TimesheetRowContent;
		content.onBeginEditing();
		expect(onViewEditing).toHaveBeenCalled();
	});

	it("should be able to switch to the editing view and back to the normal view", () => {
		const onViewEditing = vi.spyOn(component, "onViewEditing");
		const onViewContent = vi.spyOn(component, "onViewContent");

		component.load();

		const content = component.getContent() as TimesheetRowContent;
		expect(content).toBeInstanceOf(TimesheetRowContent);
		content.onBeginEditing();
		expect(onViewEditing).toHaveBeenCalled();

		const editingContent = component.getContent() as TimesheetRowContentEditing;
		expect(editingContent).toBeInstanceOf(TimesheetRowContentEditing);
		editingContent.onFinishEditing();
		expect(onViewContent).toHaveBeenCalled();
	});
});

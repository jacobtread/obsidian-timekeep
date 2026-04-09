// @vitest-environment happy-dom

import moment from "moment";
import { App } from "obsidian";
import { v4 } from "uuid";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings, TimekeepSettings } from "@/settings";
import { createStore, Store } from "@/store";
import { TimeEntry, Timekeep } from "@/timekeep/schema";

import { TimesheetRowContent } from "./TimesheetRowContent";

describe("TimesheetRowContent", () => {
	const start = moment();

	const entry: TimeEntry = {
		id: v4(),
		name: "Test",
		startTime: moment(start),
		endTime: null,
		subEntries: null,
	};

	let containerEl: HTMLElement;
	let app: App;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let onBeginEditing: Mock<() => void>;

	beforeEach(() => {
		app = {} as App;
		containerEl = createMockContainer();
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);

		onBeginEditing = vi.fn();
	});

	it("should load without error", () => {
		const component = new TimesheetRowContent(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			0,
			onBeginEditing
		);
		component.load();
	});

	it("folder row should have a folder icon", () => {
		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: null,
			endTime: null,
			folder: true,
			subEntries: [],
		};
		const component = new TimesheetRowContent(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			0,
			onBeginEditing
		);
		component.load();

		const icon = component.wrapperEl?.querySelector(".timekeep-folder-icon");
		expect(icon).not.toBeNull();
		expect(icon).toBeInstanceOf(SVGElement);
	});

	it("folder row or groups should be collapsible", () => {
		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: null,
			endTime: null,
			folder: true,
			subEntries: [],
		};

		const collapsed: TimeEntry = {
			id: entry.id,
			name: "Test",
			startTime: null,
			endTime: null,
			folder: true,
			subEntries: [],
			collapsed: true,
		};

		timekeep.setState({ entries: [entry] });

		const component = new TimesheetRowContent(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			0,
			onBeginEditing
		);
		const onToggleCollapse = vi.spyOn(component, "onToggleCollapsed");

		component.load();

		const icon = component.wrapperEl?.querySelector(".timekeep-collapse-icon");
		expect(icon).not.toBeNull();
		expect(icon).toBeInstanceOf(SVGElement);

		(icon as SVGElement).dispatchEvent(
			new MouseEvent("click", {
				bubbles: true,
				cancelable: false,
			})
		);

		expect(onToggleCollapse).toHaveBeenCalled();

		const timekeepState: Timekeep = timekeep.getState();
		expect(timekeepState.entries[0]).toEqual(collapsed);
	});

	it("item should be able to be started from clicking the start icon", () => {
		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: null,
			endTime: null,
			folder: true,
			subEntries: [],
		};

		timekeep.setState({ entries: [entry] });

		const component = new TimesheetRowContent(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			0,
			onBeginEditing
		);
		const onClickStart = vi.spyOn(component, "onClickStart");

		component.load();

		const icon = component.wrapperEl?.querySelector('.timekeep-action[data-action="start"]');
		expect(icon).not.toBeNull();
		expect(icon).toBeInstanceOf(HTMLButtonElement);

		(icon as SVGElement).dispatchEvent(
			new MouseEvent("click", {
				bubbles: true,
				cancelable: false,
			})
		);

		expect(onClickStart).toHaveBeenCalled();
	});
});

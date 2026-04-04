// @vitest-environment happy-dom

import moment from "moment";
import { App } from "obsidian";
import { v4 } from "uuid";
import { beforeEach, describe, it, Mock, vi } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings, TimekeepSettings } from "@/settings";
import { createStore, Store } from "@/store";
import { TimeEntry, Timekeep } from "@/timekeep/schema";

import { TimesheetRowContent } from "./timesheetRowContent";

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
});

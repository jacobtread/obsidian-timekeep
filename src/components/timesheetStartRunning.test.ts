// @vitest-environment happy-dom

import moment from "moment";
import { v4 } from "uuid";
import { describe, it, vi, beforeEach } from "vitest";

import type { TimeEntry, Timekeep } from "@/timekeep/schema";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings, type TimekeepSettings } from "@/settings";
import { createStore, type Store } from "@/store";

import { TimesheetStartRunning } from "./timesheetStartRunning";

describe("TimesheetStartRunning", () => {
	let containerEl: HTMLElement;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let onStartEditing: VoidFunction;

	const start = moment();
	const entry: TimeEntry = {
		id: v4(),
		name: "Group",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: v4(),
				name: "Test",
				startTime: moment(start),
				endTime: null,
				subEntries: null,
			},
		],
	};

	beforeEach(() => {
		containerEl = createMockContainer();
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);
		onStartEditing = vi.fn();
	});

	it("should load without error", () => {
		const component = new TimesheetStartRunning(
			containerEl,
			timekeep,
			settings,
			entry,
			onStartEditing
		);
		component.load();
	});
});

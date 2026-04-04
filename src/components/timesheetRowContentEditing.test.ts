// @vitest-environment happy-dom

import type { App } from "obsidian";

import moment from "moment";
import { v4 } from "uuid";
import { beforeEach, it, describe, Mock, vi } from "vitest";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { TimeEntry, Timekeep } from "@/timekeep/schema";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings } from "@/settings";
import { createStore } from "@/store";

import { TimesheetRowContentEditing } from "./timesheetRowContentEditing";

describe("TimesheetRowContentEditing", () => {
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
	let onFinishEditing: Mock<() => void>;

	beforeEach(() => {
		app = {} as App;
		containerEl = createMockContainer();
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);

		onFinishEditing = vi.fn();
	});

	it("should load without error", () => {
		const component = new TimesheetRowContentEditing(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			onFinishEditing
		);
		component.load();
	});
});

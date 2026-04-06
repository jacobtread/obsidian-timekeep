// @vitest-environment happy-dom

import type { App } from "obsidian";

import { beforeEach, describe, expect, it } from "vitest";

import type { Timekeep } from "@/timekeep/schema";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings, type TimekeepSettings } from "@/settings";
import { createStore, type Store } from "@/store";

import { TimesheetTable } from "./timesheetTable";

describe("TimesheetTable", () => {
	let containerEl: HTMLElement;
	let app: App;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let component: TimesheetTable;

	beforeEach(() => {
		containerEl = createMockContainer();
		app = {} as App;
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);
		component = new TimesheetTable(containerEl, app, timekeep, settings);
	});

	it("should load without error", () => {
		expect(() => component.load()).not.toThrow();
	});
});

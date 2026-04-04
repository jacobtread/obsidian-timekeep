// @vitest-environment happy-dom

import { beforeEach, it, describe, vi } from "vitest";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { Timekeep } from "@/timekeep/schema";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings } from "@/settings";
import { createStore } from "@/store";

import { TimesheetStartEditing } from "./timesheetStartEditing";

describe("TimesheetStartEditing", () => {
	let containerEl: HTMLElement;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let onFinishedEditing: VoidFunction;

	beforeEach(() => {
		containerEl = createMockContainer();
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);
		onFinishedEditing = vi.fn();
	});

	it("should load without error", () => {
		const component = new TimesheetStartEditing(
			containerEl,
			timekeep,
			settings,
			"Test Entry",
			onFinishedEditing
		);
		component.load();
	});
});

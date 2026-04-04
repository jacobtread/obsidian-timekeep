// @vitest-environment happy-dom

import { beforeEach, it, describe } from "vitest";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { Timekeep } from "@/timekeep/schema";

import { createMockContainer, MockVault } from "@/__mocks__/obsidian";
import { TimekeepAutocomplete } from "@/service/autocomplete";
import { TimekeepRegistry } from "@/service/registry";
import { defaultSettings } from "@/settings";
import { createStore } from "@/store";

import { TimesheetStart } from "./timesheetStart";

describe("TimesheetStart", () => {
	let containerEl: HTMLElement;
	let vault: MockVault;

	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let registry: TimekeepRegistry;
	let autocomplete: TimekeepAutocomplete;

	beforeEach(() => {
		vault = new MockVault();
		containerEl = createMockContainer();
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);

		registry = new TimekeepRegistry(vault.asVault(), settings);
		autocomplete = new TimekeepAutocomplete(registry, settings);
	});

	it("should load without error", () => {
		const component = new TimesheetStart(containerEl, timekeep, settings, autocomplete);
		component.load();
	});
});

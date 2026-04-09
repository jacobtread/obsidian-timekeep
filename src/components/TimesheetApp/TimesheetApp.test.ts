// @vitest-environment happy-dom

import type { App } from "obsidian";

import { beforeEach, describe, expect, it } from "vitest";

import type { CustomOutputFormat } from "@/output";
import type { Timekeep } from "@/timekeep/schema";

import { createMockContainer, MockVault } from "@/__mocks__/obsidian";
import { TimekeepAutocomplete } from "@/service/autocomplete";
import { TimekeepRegistry } from "@/service/registry";
import { defaultSettings, type TimekeepSettings } from "@/settings";
import { createStore, type Store } from "@/store";

import { TimesheetApp } from "./TimesheetApp";

describe("TimesheetApp", () => {
	let containerEl: HTMLElement;
	let vault: MockVault;
	let app: App;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let customOutputFormats: Store<Record<string, CustomOutputFormat>>;
	let registry: TimekeepRegistry;
	let autocomplete: TimekeepAutocomplete;
	let component: TimesheetApp;

	beforeEach(() => {
		app = {} as App;
		timekeep = createStore({ entries: [] });
		vault = new MockVault();
		containerEl = createMockContainer();
		settings = createStore(defaultSettings);
		customOutputFormats = createStore({});
		registry = new TimekeepRegistry(vault.asVault(), settings);
		autocomplete = new TimekeepAutocomplete(registry, settings);

		component = new TimesheetApp(
			containerEl,
			app,
			timekeep,
			settings,
			customOutputFormats,
			autocomplete
		);
	});

	it("should load without error", () => {
		expect(() => component.load()).not.toThrow();
	});
});

// @vitest-environment happy-dom

import type { App } from "obsidian";

import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import type { CustomOutputFormat } from "@/output";

import { createMockContainer, MockVault } from "@/__mocks__/obsidian";
import { defaultSettings, type TimekeepSettings } from "@/settings";
import { createStore, type Store } from "@/store";

import { Timesheet } from "./Timesheet";

import { TimesheetApp } from "@/components/TimesheetApp";
import { TimesheetSaveError } from "@/components/TimesheetSaveError";

import type { Timekeep } from "@/timekeep/schema";

import { TimekeepAutocomplete } from "@/service/autocomplete";
import { TimekeepRegistry } from "@/service/registry";

describe("Timesheet", () => {
	let containerEl: HTMLElement;
	let vault: MockVault;
	let app: App;
	let timekeep: Store<Timekeep>;
	let saveError: Store<boolean>;
	let settings: Store<TimekeepSettings>;
	let customOutputFormats: Store<Record<string, CustomOutputFormat>>;
	let registry: TimekeepRegistry;
	let autocomplete: TimekeepAutocomplete;
	let component: Timesheet;

	let handleSaveTimekeep: Mock<(value: Timekeep) => Promise<void>>;

	beforeEach(() => {
		app = {} as App;
		timekeep = createStore({ entries: [] });
		saveError = createStore(false);
		vault = new MockVault();
		containerEl = createMockContainer();
		settings = createStore(defaultSettings);
		customOutputFormats = createStore({});
		registry = new TimekeepRegistry(vault.asVault(), settings);
		autocomplete = new TimekeepAutocomplete(registry, settings);
		handleSaveTimekeep = vi.fn();

		component = new Timesheet(
			containerEl,
			app,
			timekeep,
			saveError,
			settings,
			customOutputFormats,
			autocomplete,
			handleSaveTimekeep
		);
	});

	it("should load without error", () => {
		expect(() => component.load()).not.toThrow();
	});

	it("default content should be the timesheet app", () => {
		component.load();
		expect(component.getContent()).toBeInstanceOf(TimesheetApp);
	});

	it("on save error the content should be a save error message", () => {
		component.load();

		saveError.setState(true);
		expect(component.getContent()).toBeInstanceOf(TimesheetSaveError);
	});
});

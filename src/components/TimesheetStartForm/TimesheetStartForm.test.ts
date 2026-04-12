// @vitest-environment happy-dom

import moment from "moment";
import { beforeEach, it, describe, afterEach, vi, expect } from "vitest";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";

import { createMockContainer, MockVault } from "@/__mocks__/obsidian";
import { defaultSettings } from "@/settings";
import { createStore } from "@/store";

import { TimesheetStartForm } from "./TimesheetStartForm";

import { defaultTimekeep, type Timekeep } from "@/timekeep/schema";

import { TimekeepAutocomplete } from "@/service/autocomplete";
import { TimekeepRegistry } from "@/service/registry";

vi.mock(import("uuid"), async (importOriginal) => {
	return {
		...(await importOriginal()),
		v4: vi.fn(() => "mocked-uuid"),
	};
});

describe("TimesheetStart", () => {
	let containerEl: HTMLElement;
	let vault: MockVault;

	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let registry: TimekeepRegistry;
	let autocomplete: TimekeepAutocomplete;
	let component: TimesheetStartForm;

	beforeEach(() => {
		vault = new MockVault();
		containerEl = createMockContainer();
		timekeep = createStore(defaultTimekeep());
		settings = createStore(defaultSettings);

		registry = new TimekeepRegistry(vault.asVault(), settings);
		autocomplete = new TimekeepAutocomplete(registry, settings);
	});

	afterEach(() => {
		if (component) component.unload();
	});

	it("should load without error", () => {
		component = new TimesheetStartForm(containerEl, timekeep, settings, autocomplete);
		component.load();
	});

	it("clicking start should start a new entry with the name", () => {
		const start = moment();

		vi.setSystemTime(start.toDate());

		component = new TimesheetStartForm(containerEl, timekeep, settings, autocomplete);

		const onStart = vi.spyOn(component, "onStart");
		component.load();

		const formEl = component.wrapperEl as HTMLFormElement;
		const nameInputEl = formEl.querySelector("#timekeepBlockName");
		(nameInputEl as HTMLInputElement).value = "Test";

		formEl.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
		expect(onStart).toHaveBeenCalled();

		expect(timekeep.getState()).toEqual({
			entries: [
				{
					id: "mocked-uuid",
					name: "Test",
					startTime: moment(start),
					endTime: null,
					subEntries: null,
				},
			],
		});
	});
});

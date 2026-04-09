// @vitest-environment happy-dom

import moment from "moment";
import { v4 } from "uuid";
import { beforeEach, it, describe, vi, expect } from "vitest";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings } from "@/settings";
import { createStore } from "@/store";

import { TimesheetRunningEntryEditing } from "./TimesheetRunningEntryEditing";

import type { Timekeep } from "@/timekeep/schema";

describe("TimesheetRunningEntryEditing", () => {
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
		const component = new TimesheetRunningEntryEditing(
			containerEl,
			timekeep,
			settings,
			"Test Entry",
			onFinishedEditing
		);
		component.load();
	});

	it("should save nothing if the running entry doesn't exist", () => {
		const component = new TimesheetRunningEntryEditing(
			containerEl,
			timekeep,
			settings,
			"Test Entry",
			onFinishedEditing
		);

		const onSave = vi.spyOn(component, "onSave");

		component.load();

		const formEl = component.wrapperEl!;
		(formEl as HTMLFormElement).dispatchEvent(
			new SubmitEvent("submit", { bubbles: true, cancelable: false })
		);
		expect(onSave).toHaveBeenCalled();
	});

	it("should be able to save the running entry", () => {
		const start = moment();
		const end = moment().add(1, "hour");
		vi.setSystemTime(end.toDate());

		const entry = {
			id: v4(),
			name: "Test",
			startTime: moment(start),
			endTime: null,
			subEntries: null,
		};

		timekeep.setState({
			entries: [entry],
		});

		const component = new TimesheetRunningEntryEditing(
			containerEl,
			timekeep,
			settings,
			"Test Entry",
			onFinishedEditing
		);

		const onSave = vi.spyOn(component, "onSave");

		component.load();

		const formEl = component.wrapperEl!;

		const nameInputEl = formEl.querySelector(".timekeep-name");
		expect(nameInputEl).not.toBeNull();
		(nameInputEl as HTMLInputElement).value = "New Name";

		(formEl as HTMLFormElement).dispatchEvent(
			new SubmitEvent("submit", { bubbles: true, cancelable: false })
		);
		expect(onSave).toHaveBeenCalled();

		expect(timekeep.getState()).toEqual({
			entries: [{ ...entry, name: "New Name" }],
		});
	});
});

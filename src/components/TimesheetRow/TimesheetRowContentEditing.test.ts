// @vitest-environment happy-dom

import type { App } from "obsidian";

import moment from "moment";
import { v4 } from "uuid";
import { beforeEach, it, describe, Mock, vi, expect, afterEach } from "vitest";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { TimeEntry, Timekeep } from "@/timekeep/schema";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings } from "@/settings";
import { createStore } from "@/store";

import { TimesheetRowContentEditing } from "./TimesheetRowContentEditing";

describe("TimesheetRowContentEditing", () => {
	let containerEl: HTMLElement;
	let app: App;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let onFinishEditing: Mock<() => void>;
	let component: TimesheetRowContentEditing;

	beforeEach(() => {
		app = {} as App;
		containerEl = createMockContainer();
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);
		onFinishEditing = vi.fn();
	});

	afterEach(() => {
		if (component) component.unload();
	});

	it("should load without error", () => {
		const start = moment();

		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: moment(start),
			endTime: null,
			subEntries: null,
		};

		component = new TimesheetRowContentEditing(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			onFinishEditing
		);
		component.load();
	});

	it("clicking the cancel button should call onFinishEditing", () => {
		const start = moment();

		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: moment(start),
			endTime: null,
			subEntries: null,
		};
		component = new TimesheetRowContentEditing(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			onFinishEditing
		);
		component.load();

		const cancelButton = containerEl.querySelector('.timekeep-action[data-action="cancel"]');
		expect(cancelButton).not.toBeNull();
		(cancelButton as HTMLButtonElement).click();
		expect(onFinishEditing).toHaveBeenCalledOnce();
	});

	it("clicking the save button should update the timekeep state call onFinishEditing", () => {
		const start = moment();

		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: moment(start),
			endTime: moment(start),
			subEntries: null,
		};

		const setState = vi.spyOn(timekeep, "setState");

		component = new TimesheetRowContentEditing(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			onFinishEditing
		);
		const onSubmit = vi.spyOn(component, "onSubmit");
		component.load();

		const form = containerEl.querySelector("form.timesheet-editing");
		expect(form).not.toBeNull();
		(form as HTMLFormElement).dispatchEvent(
			new SubmitEvent("submit", { bubbles: true, cancelable: true })
		);

		expect(onSubmit).toHaveBeenCalledOnce();
		expect(onFinishEditing).toHaveBeenCalledOnce();
		expect(setState).toHaveBeenCalledOnce();
	});

	it("editing a group entry should hide the start and end time inputs", () => {
		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [],
		};

		component = new TimesheetRowContentEditing(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			onFinishEditing
		);
		component.load();

		const startTime =
			containerEl.querySelector('.timekeep-input[name="start-time"]')?.parentElement ?? null;
		const endTime =
			containerEl.querySelector('.timekeep-input[name="end-time"]')?.parentElement ?? null;

		expect(startTime).not.toBeNull();
		expect(endTime).not.toBeNull();
		expect((startTime as HTMLElement).hidden).toBeTruthy();
		expect((endTime as HTMLElement).hidden).toBeTruthy();
	});

	it("clicking delete on an entry should open a modal for confirmation", () => {
		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [],
		};

		component = new TimesheetRowContentEditing(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			onFinishEditing
		);
		const onConfirmDelete = vi.spyOn(component, "onConfirmDelete");
		component.load();

		const deleteButton = containerEl.querySelector('.timekeep-action[data-action="delete"]');
		expect(deleteButton).not.toBeNull();
		(deleteButton as HTMLButtonElement).click();

		expect(onConfirmDelete).toHaveBeenCalled();

		const contentEl: HTMLElement = document!.querySelector(".mock-modal-content")!;
		expect(contentEl).toBeInstanceOf(HTMLElement);
	});

	it("cancelling deletion should do nothing", () => {
		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [],
		};

		timekeep.setState({ entries: [entry] });

		component = new TimesheetRowContentEditing(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			onFinishEditing
		);
		const onConfirmDelete = vi.spyOn(component, "onConfirmDelete");
		const onConfirmedDelete = vi.spyOn(component, "onConfirmedDelete");
		component.load();

		const deleteButton = containerEl.querySelector('.timekeep-action[data-action="delete"]');
		expect(deleteButton).not.toBeNull();
		(deleteButton as HTMLButtonElement).click();

		expect(onConfirmDelete).toHaveBeenCalled();

		const contentEl: HTMLElement = document!.querySelector(".mock-modal-content")!;
		expect(contentEl).toBeInstanceOf(HTMLElement);

		const cancelButton = contentEl.querySelector(
			'.timekeep-confirm-modal-button[data-action="cancel"]'
		);
		expect(cancelButton).not.toBeNull();
		(cancelButton as HTMLButtonElement).click();

		expect(onConfirmedDelete).toHaveBeenCalledWith(false);

		// Timekeep should not be empty
		expect(timekeep.getState()).toEqual({ entries: [entry] });
	});

	it("confirming deletion should remove the entry from the timekeep", () => {
		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [],
		};

		timekeep.setState({ entries: [entry] });

		component = new TimesheetRowContentEditing(
			containerEl,
			app,
			timekeep,
			settings,
			entry,
			onFinishEditing
		);
		const onConfirmDelete = vi.spyOn(component, "onConfirmDelete");
		const onConfirmedDelete = vi.spyOn(component, "onConfirmedDelete");
		component.load();

		const deleteButton = containerEl.querySelector('.timekeep-action[data-action="delete"]');
		expect(deleteButton).not.toBeNull();
		(deleteButton as HTMLButtonElement).click();

		expect(onConfirmDelete).toHaveBeenCalled();

		const contentEl: HTMLElement = document!.querySelector(".mock-modal-content")!;
		expect(contentEl).toBeInstanceOf(HTMLElement);

		const okButton = contentEl.querySelector(
			'.timekeep-confirm-modal-button[data-action="ok"]'
		);
		expect(okButton).not.toBeNull();
		(okButton as HTMLButtonElement).click();

		expect(onConfirmedDelete).toHaveBeenCalledWith(true);

		// Timekeep should be empty
		expect(timekeep.getState()).toEqual({ entries: [] });
	});
});

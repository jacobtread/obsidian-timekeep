// @vitest-environment happy-dom

import type { App } from "obsidian";

import { beforeEach, describe, expect, it } from "vitest";

import { createMockContainer, MockVault } from "@/__mocks__/obsidian";
import { defaultSettings, type TimekeepSettings } from "@/settings";
import { createStore, type Store } from "@/store";

import { TimesheetStatusBar } from "./TimesheetStatusBar";

import { TimekeepRegistry } from "@/service/registry";

describe("TimesheetStatusBar", () => {
	let containerEl: HTMLElement;
	let vault: MockVault;
	let app: App;
	let settings: Store<TimekeepSettings>;
	let registry: TimekeepRegistry;
	let component: TimesheetStatusBar;

	beforeEach(() => {
		app = {} as App;
		vault = new MockVault();
		containerEl = createMockContainer();
		settings = createStore(defaultSettings);
		registry = new TimekeepRegistry(vault.asVault(), settings);

		component = new TimesheetStatusBar(containerEl, app, registry);
	});

	it("should load without error", () => {
		expect(() => component.load()).not.toThrow();
	});
});

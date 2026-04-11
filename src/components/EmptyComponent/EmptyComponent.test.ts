// @vitest-environment happy-dom

import { describe, it, expect, beforeEach } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";

import { EmptyComponent } from "./EmptyComponent";

describe("EmptyComponent", () => {
	let container: HTMLElement;
	let component: EmptyComponent;

	beforeEach(() => {
		container = createMockContainer();
		component = new EmptyComponent(container);
	});

	it("should load without error", () => {
		expect(() => component.load()).not.toThrow();
		expect(container.children.length).toBe(1);
	});
});

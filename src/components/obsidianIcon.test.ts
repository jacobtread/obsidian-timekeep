// @vitest-environment happy-dom

import { setIcon } from "obsidian";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";

import { createObsidianIcon } from "./obsidianIcon";

vi.mock("obsidian", () => ({
	setIcon: vi.fn((containerEl: HTMLElement, icon: string) => {
		containerEl.innerHTML += `<svg data-icon="${icon}"></svg>`;
	}),
}));

describe("createObsidianIcon", () => {
	let container: HTMLElement;

	beforeEach(() => {
		vi.clearAllMocks();

		container = createMockContainer();
	});

	it("should create a wrapper div and set its class", () => {
		const wrapper = createObsidianIcon(container, "star");

		expect(wrapper).toBeInstanceOf(HTMLDivElement);
		expect(wrapper.classList.length).toBe(1);
		expect(wrapper.classList.contains("timekeep-icon-wrapper")).toBe(true);
	});

	it("should call setIcon with wrapper and icon name", () => {
		const wrapper = createObsidianIcon(container, "star");

		expect(setIcon).toHaveBeenCalledTimes(1);
		expect(setIcon).toHaveBeenCalledWith(wrapper, "star");
	});

	it("should add class to the first child if className is a string", () => {
		const wrapper = createObsidianIcon(container, "star", "my-class");
		const firstChild = wrapper.firstElementChild as SVGElement;

		expect(firstChild.classList.length).toBe(1);
		expect(firstChild.classList.contains("my-class")).toBe(true);
	});

	it("should add multiple classes if className is an array", () => {
		const wrapper = createObsidianIcon(container, "star", ["class1", "class2"]);
		const firstChild = wrapper.firstElementChild as SVGElement;
		expect(firstChild.classList.length).toBe(2);
		expect(firstChild.classList.contains("class1")).toBe(true);
		expect(firstChild.classList.contains("class2")).toBe(true);
	});

	it("should not call addClass if no className is provided", () => {
		const wrapper = createObsidianIcon(container, "star");
		const firstChild = wrapper.firstElementChild as SVGElement;
		expect(firstChild.classList.length).toBe(0);
	});
});

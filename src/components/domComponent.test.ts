// @vitest-environment happy-dom

import { Component } from "obsidian";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";

import { DomComponent } from "./domComponent";

describe("DomComponent", () => {
	let container: HTMLElement;

	beforeEach(() => {
		container = createMockContainer();
	});

	it("should set containerEl on construction", () => {
		const comp = new DomComponent(container);
		expect(comp.containerEl).toBe(container);
		expect(comp.unmounted).toBe(false);
		expect(comp.wrapperEl).toBeUndefined();
		expect(comp.parent).toBeNull();
	});

	it("should add a child and set parent if child is DomComponent", () => {
		const parent = new DomComponent(container);
		const child = new DomComponent(container);

		const returned = parent.addChild(child);

		expect(returned).toBe(child);
		expect(child.parent).toBe(parent);
	});

	it("should remove a child and reset its parent", () => {
		const parent = new DomComponent(container);
		const child = new DomComponent(container);

		parent.addChild(child);
		const returned = parent.removeChild(child);

		expect(returned).toBe(child);
		expect(child.parent).toBeNull();
	});

	it("isUnloadSkipped should return true if parent is unmounted", () => {
		const parent = new DomComponent(container);
		const child = new DomComponent(container);

		parent.addChild(child);
		parent.unload();

		expect(child.isUnloadSkipped()).toBe(true);
	});

	it("isUnloadSkipped should return false if no parent", () => {
		const comp = new DomComponent(container);
		expect(comp.isUnloadSkipped()).toBe(false);
	});

	it("unload should mark the component as unmounted before calling super.unload", () => {
		const comp = new DomComponent(container);

		comp.unload();

		expect(comp.unmounted).toBe(true);
	});

	it("onunload should remove wrapperEl if parent is not unmounted", () => {
		const comp = new DomComponent(container);
		const wrapper = document.createElement("div");
		comp.wrapperEl = wrapper;
		container.appendChild(wrapper);

		comp.onunload();

		expect(comp.unmounted).toBe(true); // only unload sets unmounted
		expect(wrapper.parentElement).toBeNull();
	});

	it("onunload should skip removing wrapperEl if parent is unmounted", () => {
		const parent = new DomComponent(container);
		const child = new DomComponent(container);

		parent.addChild(child);
		parent.unmounted = true;

		const wrapper = document.createElement("div");
		child.wrapperEl = wrapper;
		container.appendChild(wrapper);

		child.onunload();

		expect(child.unmounted).toBe(true);
		expect(wrapper.parentElement).toBe(container);
	});

	it("nested unload: children skip DOM removal when parent is unloaded", () => {
		class SimpleComponent extends DomComponent {
			id: string;
			constructor(id: string, containerEl: HTMLElement) {
				super(containerEl);
				this.id = id;
			}

			onload(): void {
				super.onload();
				this.wrapperEl = this.containerEl.createDiv();
			}
		}

		const parent = new SimpleComponent("parent", container);
		parent.load();

		const child = new SimpleComponent("child", parent.wrapperEl!);
		child.load();

		const grandchild = new SimpleComponent("grandchild", child.wrapperEl!);
		grandchild.load();

		parent.addChild(child);
		child.addChild(grandchild);

		parent.unload();

		// Everything should be unmounted
		expect(parent.unmounted).toBe(true);
		expect(child.unmounted).toBe(true);
		expect(grandchild.unmounted).toBe(true);

		// Parent should be disconnected from the DOM
		expect(parent.wrapperEl!.parentElement).toBeNull();

		// All children should be parented to a element
		expect(child.wrapperEl!.parentNode).toBe(child.containerEl);
		expect(grandchild.wrapperEl!.parentNode).toBe(grandchild.containerEl);
	});

	it("regular component should be able to be added as child", () => {
		class RegularComponent extends Component {
			constructor() {
				super();
			}
		}

		const parent = new DomComponent(container);
		const child = new RegularComponent();

		const childOnunload = vi.spyOn(child, "onunload");
		const childOnload = vi.spyOn(child, "onload");

		parent.addChild(child);
		parent.load();

		parent.unload();

		expect(childOnunload).toHaveBeenCalled();
		expect(childOnload).toHaveBeenCalled();
	});

	it("regular component should be able to be removed from children", () => {
		class RegularComponent extends Component {
			constructor() {
				super();
			}
		}

		const parent = new DomComponent(container);
		const child = new RegularComponent();

		const childOnunload = vi.spyOn(child, "onunload");
		const childOnload = vi.spyOn(child, "onload");

		parent.addChild(child);
		parent.load();

		parent.removeChild(child);

		parent.unload();

		expect(childOnunload).toHaveBeenCalled();
		expect(childOnload).toHaveBeenCalled();
	});
});

// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";

import { ReplaceableComponent } from "./ReplaceableComponent";

import { ContentComponent } from "@/components/ContentComponent";
import { DomComponent } from "@/components/DomComponent";

describe("ReplaceableComponent", () => {
	it("load in without a previous element should cause a normal append", () => {
		const container = createMockContainer();
		const parent = new DomComponent(container);
		const wrapperEl = createMockContainer();
		parent.wrapperEl = wrapperEl;

		const replaceChild = vi.spyOn(wrapperEl, "replaceChild");
		const appendChild = vi.spyOn(wrapperEl, "appendChild");

		class TestReplaceable extends ReplaceableComponent {
			constructor(containerEl: HTMLElement) {
				super(containerEl);
			}

			createContainer(): HTMLElement {
				return createMockContainer();
			}

			render(wrapperEl: HTMLElement): void {
				wrapperEl.createSpan({ text: "Test" });
			}
		}

		const replaceable = new TestReplaceable(wrapperEl);
		parent.load();

		parent.addChild(replaceable);

		expect(replaceChild).not.toHaveBeenCalled();
		expect(appendChild).toHaveBeenCalledTimes(1);
	});

	it("unloading from a regular parent should perform a regular unload", () => {
		const container = createMockContainer();
		const parent = new DomComponent(container);
		const wrapperEl = createMockContainer();
		parent.wrapperEl = wrapperEl;

		const removeChild = vi.spyOn(wrapperEl, "removeChild");

		class TestReplaceable extends ReplaceableComponent {
			constructor(containerEl: HTMLElement) {
				super(containerEl);
			}

			createContainer(): HTMLElement {
				return createMockContainer();
			}

			render(wrapperEl: HTMLElement): void {
				wrapperEl.createSpan({ text: "Test" });
			}
		}

		const replaceable = new TestReplaceable(wrapperEl);
		parent.load();

		parent.addChild(replaceable);
		parent.removeChild(replaceable);

		expect(replaceable.isUnloadSkipped()).toBe(false);
		expect(removeChild).toHaveBeenCalledTimes(1);
	});

	it("load in with a previous element should cause a replace", () => {
		class FirstComponent extends ReplaceableComponent {
			testContainer: HTMLElement | undefined;

			constructor(containerEl: HTMLElement) {
				super(containerEl);
			}

			createContainer(): HTMLElement {
				this.testContainer = createDiv();
				return this.testContainer;
			}

			render(wrapperEl: HTMLElement): void {
				wrapperEl.createSpan({ text: "First" });
			}
		}

		class SecondComponent extends ReplaceableComponent {
			testContainer: HTMLElement | undefined;

			constructor(containerEl: HTMLElement) {
				super(containerEl);
			}

			createContainer(): HTMLElement {
				this.testContainer = createDiv();
				return this.testContainer;
			}

			render(wrapperEl: HTMLElement): void {
				wrapperEl.createSpan({ text: "Second" });
			}
		}

		const container = createMockContainer();
		const replaceChild = vi.spyOn(container, "replaceChild");

		const comp = new ContentComponent<FirstComponent | SecondComponent>(container);
		comp.load();

		const firstComponent = new FirstComponent(container);
		const secondComponent = new SecondComponent(container);

		comp.setContent(firstComponent);
		expect(container.children[0].textContent).toBe("First");
		expect(container.children[0]).toBe(firstComponent.testContainer);

		comp.setContent(secondComponent);

		// Child container and text should match
		expect(container.children[0]).toBe(secondComponent.testContainer);
		expect(container.children[0].textContent).toBe("Second");

		// First component should skip unloading
		expect(firstComponent.isUnloadSkipped()).toBe(true);
		expect(firstComponent.skipUnloadReplace).toBe(true);

		expect(replaceChild).toHaveBeenCalledTimes(1);
	});

	it("unloading should be skipped when using a content component with two replaceable component", () => {
		class FirstComponent extends ReplaceableComponent {
			testContainer: HTMLElement | undefined;

			constructor(containerEl: HTMLElement) {
				super(containerEl);
			}

			createContainer(): HTMLElement {
				this.testContainer = createDiv();
				return this.testContainer;
			}

			render(wrapperEl: HTMLElement): void {
				wrapperEl.createSpan({ text: "First" });
			}
		}

		class SecondComponent extends ReplaceableComponent {
			testContainer: HTMLElement | undefined;

			constructor(containerEl: HTMLElement) {
				super(containerEl);
			}

			createContainer(): HTMLElement {
				this.testContainer = createDiv();
				return this.testContainer;
			}

			render(wrapperEl: HTMLElement): void {
				wrapperEl.createSpan({ text: "Second" });
			}
		}

		const container = createMockContainer();
		const replaceChild = vi.spyOn(container, "replaceChild");

		const comp = new ContentComponent<FirstComponent | SecondComponent>(container);
		comp.load();

		const firstComponent = new FirstComponent(container);
		const secondComponent = new SecondComponent(container);

		comp.setContent(firstComponent);
		comp.setContent(secondComponent);

		// First component should skip unloading
		expect(firstComponent.isUnloadSkipped()).toBe(true);
		expect(firstComponent.skipUnloadReplace).toBe(true);
		expect(replaceChild).toHaveBeenCalledTimes(1);
	});
});

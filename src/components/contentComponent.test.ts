// @vitest-environment happy-dom

import { describe, it, expect, beforeEach } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";

import { ContentComponent } from "./contentComponent";
import { DomComponent } from "./domComponent";
import { ReplaceableComponent } from "./replaceableComponent";

describe("ContentComponent", () => {
	let container: HTMLElement;

	beforeEach(() => {
		container = createMockContainer();
	});

	it("should be empty on initialization", () => {
		const comp = new ContentComponent(container);
		comp.load();

		expect(comp.getContent()).toBeUndefined();
	});

	it("should be able to set content to different components", () => {
		class FirstComponent extends DomComponent {
			constructor(containerEl: HTMLElement) {
				super(containerEl);
			}

			onload(): void {
				super.onload();

				const wrapperEl = this.containerEl.createSpan({ text: "First" });
				this.wrapperEl = wrapperEl;
			}
		}

		class SecondComponent extends DomComponent {
			constructor(containerEl: HTMLElement) {
				super(containerEl);
			}

			onload(): void {
				super.onload();

				const wrapperEl = this.containerEl.createSpan({ text: "Second" });
				this.wrapperEl = wrapperEl;
			}
		}

		const comp = new ContentComponent<FirstComponent | SecondComponent>(container);
		comp.load();

		comp.setContent(new FirstComponent(container));
		expect(comp.containerEl!.children[0].textContent).toBe("First");

		comp.setContent(new SecondComponent(container));
		expect(comp.containerEl!.children[0].textContent).toBe("Second");

		comp.setContent(undefined);
		expect(comp.getContent()).toBeUndefined();
		expect(comp.containerEl!.children.length).toBe(0);
	});

	it("using two replaceable component should trigger the previous", () => {
		class FirstComponent extends ReplaceableComponent {
			testContainer: HTMLElement;

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
			testContainer: HTMLElement;

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
	});
});

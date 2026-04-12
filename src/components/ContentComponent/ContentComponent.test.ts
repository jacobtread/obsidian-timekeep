// @vitest-environment happy-dom

import { describe, it, expect, beforeEach } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";

import { ContentComponent } from "./ContentComponent";

import { ReplaceableComponent } from "@/components/ReplaceableComponent";

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
		class FirstComponent extends ReplaceableComponent {
			constructor(containerEl: HTMLElement) {
				super(containerEl);
			}

			createContainer(): HTMLElement {
				return createDiv();
			}

			render(containerEl: HTMLElement): void {
				containerEl.createSpan({ text: "First" });
			}
		}

		class SecondComponent extends ReplaceableComponent {
			constructor(containerEl: HTMLElement) {
				super(containerEl);
			}

			createContainer(): HTMLElement {
				return createDiv();
			}

			render(containerEl: HTMLElement): void {
				containerEl.createSpan({ text: "Second" });
			}
		}

		const comp = new ContentComponent<FirstComponent | SecondComponent>(container);
		comp.load();

		comp.setContent(new FirstComponent(container));
		expect(comp.containerEl!.children[0].textContent).toBe("First");

		comp.setContent(new SecondComponent(container));
		expect(comp.containerEl!.children[0].textContent).toBe("Second");
	});

	it("using two replaceable component should trigger the previous", () => {
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

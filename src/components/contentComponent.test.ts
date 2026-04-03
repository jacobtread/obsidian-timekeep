// @vitest-environment happy-dom

import { describe, it, expect, beforeEach } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";

import { ContentComponent } from "./contentComponent";
import { DomComponent } from "./domComponent";

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
});

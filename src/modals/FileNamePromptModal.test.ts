// @vitest-environment happy-dom

import type { App } from "obsidian";

import { describe, it, expect, beforeEach, Mock, vi } from "vitest";

import { FileNamePromptModal } from "./FileNamePromptModal";

describe("ConfirmModal", () => {
	let app: App;
	let onChoice: Mock<(name: string | null) => void>;
	let component: FileNamePromptModal;

	beforeEach(() => {
		app = {} as App;
		onChoice = vi.fn();
		component = new FileNamePromptModal(app, onChoice);
	});

	it("should open without error", () => {
		expect(() => component.open()).not.toThrow();
	});

	it("clicking Ok should call onChoice with the current name value", () => {
		component.open();

		const input = component.contentEl.querySelector(".timekeep-pick-file-name-input");
		(input as HTMLInputElement).value = "Test";

		const button = component.contentEl.querySelectorAll("button").item(0);
		expect(button.textContent).toBe("Ok");

		button.click();

		expect(onChoice).toHaveBeenCalledWith("Test");
	});

	it("clicking Cancel should call onChoice with null", () => {
		component.open();

		const button = component.contentEl.querySelectorAll("button").item(1);
		expect(button.textContent).toBe("Cancel");

		button.click();

		expect(onChoice).toHaveBeenCalledWith(null);
	});

	it("closing without picking should call onChoice with null", () => {
		component.open();
		component.close();
		expect(onChoice).toHaveBeenCalledWith(null);
	});

	it("should be able to pick using async instead of callback", async () => {
		const promise = FileNamePromptModal.pick(app);

		const contentEl: HTMLElement = document!.querySelector(".mock-modal-content")!;
		expect(contentEl).toBeInstanceOf(HTMLElement);

		const input = contentEl!.querySelector(".timekeep-pick-file-name-input");
		(input as HTMLInputElement).value = "Test";

		const button = contentEl!.querySelectorAll("button").item(0);
		expect(button.textContent).toBe("Ok");
		button.click();

		const result = await promise;
		expect(result).toBe("Test");
	});
});

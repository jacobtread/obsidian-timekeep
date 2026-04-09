// @vitest-environment happy-dom

import type { App } from "obsidian";

import { describe, it, expect, beforeEach, Mock, vi } from "vitest";

import { ConfirmModal } from "./ConfirmModal";

describe("ConfirmModal", () => {
	let app: App;
	let onChoice: Mock<(choice: boolean) => void>;
	let component: ConfirmModal;

	beforeEach(() => {
		app = {} as App;
		onChoice = vi.fn();
		component = new ConfirmModal(app, "Test", onChoice);
	});

	it("should open without error", () => {
		expect(() => component.open()).not.toThrow();
	});

	it("clicking Ok should call onChoice with true", () => {
		component.open();

		const button = component.contentEl.querySelectorAll("button").item(0);
		expect(button.textContent).toBe("Ok");

		button.click();

		expect(onChoice).toHaveBeenCalledWith(true);
	});

	it("clicking Cancel should call onChoice with true", () => {
		component.open();

		const button = component.contentEl.querySelectorAll("button").item(1);
		expect(button.textContent).toBe("Cancel");

		button.click();

		expect(onChoice).toHaveBeenCalledWith(false);
	});

	it("closing without picking shouldn't call onChoice", () => {
		component.open();
		component.close();
		expect(onChoice).not.toHaveBeenCalled();
	});
});

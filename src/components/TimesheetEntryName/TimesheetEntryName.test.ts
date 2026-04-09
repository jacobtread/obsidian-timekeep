// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, vi } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";

import { TimesheetEntryName } from "./TimesheetEntryName";

describe("TimesheetEntryName", () => {
	let mockApp: any;

	beforeEach(() => {
		mockApp = {
			workspace: {
				getActiveFile: vi.fn().mockImplementation(() => ({ path: "active-file.md" })),
				openLinkText: vi.fn(),
			},
		};
	});

	it("renders all segments correctly", () => {
		const container = createMockContainer();
		const component = new TimesheetEntryName(
			container,
			mockApp,
			"Hello [World](https://example.com) [Internal](#internal-note)"
		);

		component.load();

		const wrapperEl = component.wrapperEl!;

		expect(wrapperEl.children).toHaveLength(4);

		expect(wrapperEl.children[0].tagName).toBe("SPAN");
		expect(wrapperEl.children[0].textContent).toBe("Hello ");

		expect(wrapperEl.children[1].tagName).toBe("A");
		expect(wrapperEl.children[1].textContent).toBe("World");
		expect((wrapperEl.children[1] as HTMLAnchorElement).href).toBe("https://example.com/");

		expect(wrapperEl.children[2].tagName).toBe("SPAN");
		expect(wrapperEl.children[2].textContent).toBe(" ");

		expect(wrapperEl.children[3].tagName).toBe("A");
		expect(wrapperEl.children[3].textContent).toBe("Internal");
	});

	it("handles internal link clicks", async () => {
		const container = createMockContainer();
		const component = new TimesheetEntryName(
			container,
			mockApp,
			"Hello [World](https://example.com) [Internal](internal-note.md)"
		);

		component.load();

		const wrapperEl = component.wrapperEl!;

		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		const stopPropagation = vi.spyOn(event, "stopPropagation");
		const preventDefault = vi.spyOn(event, "preventDefault");

		wrapperEl.children[3].dispatchEvent(event);

		expect(stopPropagation).toHaveBeenCalled();
		expect(preventDefault).toHaveBeenCalled();
		expect(mockApp.workspace.openLinkText).toHaveBeenCalledWith(
			"internal-note.md",
			"active-file.md"
		);
	});

	it("handles internal link clicks when file is not active", async () => {
		mockApp.workspace.getActiveFile.mockReturnValueOnce(null);

		const container = createMockContainer();
		const component = new TimesheetEntryName(
			container,
			mockApp,
			"Hello [World](https://example.com) [Internal](internal-note.md)"
		);

		component.load();

		const wrapperEl = component.wrapperEl!;

		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		const stopPropagation = vi.spyOn(event, "stopPropagation");
		const preventDefault = vi.spyOn(event, "preventDefault");

		wrapperEl.children[3].dispatchEvent(event);
		expect(stopPropagation).toHaveBeenCalled();
		expect(preventDefault).toHaveBeenCalled();
		expect(mockApp.workspace.openLinkText).not.toHaveBeenCalled();
	});

	it("name children should be removed from container on unload", () => {
		const container = createMockContainer();
		const component = new TimesheetEntryName(
			container,
			mockApp,
			"Hello [World](https://example.com) [Internal](internal-note.md)"
		);

		component.load();
		component.unload();

		expect(container.children).toHaveLength(0);
	});
});

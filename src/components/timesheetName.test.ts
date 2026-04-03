// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, vi } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";

import { TimekeepName } from "./timesheetName";

describe("TimekeepName", () => {
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
		const timekeepName = new TimekeepName(
			container,
			mockApp,
			"Hello [World](https://example.com) [Internal](#internal-note)"
		);

		timekeepName.onload();

		expect(container.children).toHaveLength(4);

		expect(container.children[0].tagName).toBe("SPAN");
		expect(container.children[0].textContent).toBe("Hello ");

		expect(container.children[1].tagName).toBe("A");
		expect(container.children[1].textContent).toBe("World");
		expect((container.children[1] as HTMLAnchorElement).href).toBe("https://example.com/");

		expect(container.children[2].tagName).toBe("SPAN");
		expect(container.children[2].textContent).toBe(" ");

		expect(container.children[3].tagName).toBe("A");
		expect(container.children[3].textContent).toBe("Internal");
	});

	it("handles internal link clicks", async () => {
		const container = createMockContainer();
		const timekeepName = new TimekeepName(
			container,
			mockApp,
			"Hello [World](https://example.com) [Internal](internal-note.md)"
		);

		timekeepName.onload();

		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		const stopPropagation = vi.spyOn(event, "stopPropagation");
		const preventDefault = vi.spyOn(event, "preventDefault");

		container.children[3].dispatchEvent(event);

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
		const timekeepName = new TimekeepName(
			container,
			mockApp,
			"Hello [World](https://example.com) [Internal](internal-note.md)"
		);

		timekeepName.onload();

		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		const stopPropagation = vi.spyOn(event, "stopPropagation");
		const preventDefault = vi.spyOn(event, "preventDefault");

		container.children[3].dispatchEvent(event);
		expect(stopPropagation).toHaveBeenCalled();
		expect(preventDefault).toHaveBeenCalled();
		expect(mockApp.workspace.openLinkText).not.toHaveBeenCalled();
	});

	it("empties container on unload", () => {
		const container = createMockContainer();
		const timekeepName = new TimekeepName(
			container,
			mockApp,
			"Hello [World](https://example.com) [Internal](internal-note.md)"
		);

		timekeepName.onunload();
		expect(container.children).toHaveLength(0);
	});
});

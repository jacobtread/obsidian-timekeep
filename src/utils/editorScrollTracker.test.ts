import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { EditorScrollTracker } from "./editorScrollTracker";

describe("EditorScrollTracker", () => {
	let mockApp: any;
	let mockEditor: any;

	beforeEach(() => {
		mockEditor = {
			getScrollInfo: vi.fn(),
			scrollTo: vi.fn(),
		};

		mockApp = {
			workspace: {
				activeEditor: {
					editor: mockEditor,
				},
			},
		};

		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	describe("save", () => {
		it("saves scroll info when editor exists", () => {
			const scrollInfo = { top: 100, left: 50 };
			mockEditor.getScrollInfo.mockReturnValue(scrollInfo);

			const tracker = new EditorScrollTracker(mockApp);
			tracker.save();

			expect(mockEditor.getScrollInfo).toHaveBeenCalled();
			expect(tracker.restoreScrollInfo).toEqual(scrollInfo);
		});

		it("does nothing if activeEditor is missing", () => {
			mockApp.workspace.activeEditor = null;

			const tracker = new EditorScrollTracker(mockApp);
			tracker.save();

			expect(tracker.restoreScrollInfo).toBeNull();
		});

		it("does nothing if editor is missing", () => {
			mockApp.workspace.activeEditor.editor = null;

			const tracker = new EditorScrollTracker(mockApp);
			tracker.save();

			expect(tracker.restoreScrollInfo).toBeNull();
		});
	});

	describe("restore", () => {
		it("restores scroll when info and editor exist", () => {
			const tracker = new EditorScrollTracker(mockApp);
			tracker.restoreScrollInfo = { top: 200, left: 75 };

			tracker.restore();

			expect(mockEditor.scrollTo).toHaveBeenCalledWith(75, 200);
		});

		it("does nothing if restoreScrollInfo is null", () => {
			const tracker = new EditorScrollTracker(mockApp);

			tracker.restore();

			expect(mockEditor.scrollTo).not.toHaveBeenCalled();
		});

		it("does nothing if activeEditor is missing", () => {
			const tracker = new EditorScrollTracker(mockApp);
			tracker.restoreScrollInfo = { top: 10, left: 20 };

			mockApp.workspace.activeEditor = null;

			tracker.restore();

			expect(mockEditor.scrollTo).not.toHaveBeenCalled();
		});

		it("does nothing if editor is missing", () => {
			const tracker = new EditorScrollTracker(mockApp);
			tracker.restoreScrollInfo = { top: 10, left: 20 };

			mockApp.workspace.activeEditor.editor = null;

			tracker.restore();

			expect(mockEditor.scrollTo).not.toHaveBeenCalled();
		});
	});

	describe("queueRestore", () => {
		it("queues restore after delay", () => {
			const tracker = new EditorScrollTracker(mockApp);
			tracker.restoreScrollInfo = { top: 300, left: 150 };

			tracker.queueRestore(100);

			expect(mockEditor.scrollTo).not.toHaveBeenCalled();

			vi.advanceTimersByTime(100);

			expect(mockEditor.scrollTo).toHaveBeenCalledWith(150, 300);
		});

		it("clears previous timeout before setting a new one", () => {
			const tracker = new EditorScrollTracker(mockApp);
			tracker.restoreScrollInfo = { top: 400, left: 200 };

			const clearSpy = vi.spyOn(global, "clearTimeout");

			tracker.queueRestore(100);
			tracker.queueRestore(200);

			expect(clearSpy).toHaveBeenCalled();

			vi.advanceTimersByTime(200);

			expect(mockEditor.scrollTo).toHaveBeenCalledTimes(1);
			expect(mockEditor.scrollTo).toHaveBeenCalledWith(200, 400);
		});
	});
});

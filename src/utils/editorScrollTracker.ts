import type { App } from "obsidian";

/**
 * Utility to handle tracking the editor scroll for saving and restoring
 * scroll on the markdown view
 */
export class EditorScrollTracker {
	app: App;

	restoreScrollTimeout: ReturnType<typeof setTimeout> | null = null;
	restoreScrollInfo: { top: number; left: number } | null = null;

	constructor(app: App) {
		this.app = app;
	}

	save() {
		const activeEditor = this.app.workspace.activeEditor;
		if (!activeEditor) return;
		const editor = activeEditor.editor;
		if (!editor) return;
		this.restoreScrollInfo = editor.getScrollInfo();
	}

	restore() {
		if (this.restoreScrollInfo === null) return;
		const activeEditor = this.app.workspace.activeEditor;

		if (!activeEditor) return;
		const editor = activeEditor.editor;

		if (!editor) return;
		editor.scrollTo(this.restoreScrollInfo.left, this.restoreScrollInfo.top);
	}

	/**
	 * Queue a restore to happen after a delay
	 *
	 * @param delayMs The delay in milliseconds before restoring
	 */
	queueRestore(delayMs: number = 50) {
		if (this.restoreScrollTimeout) {
			clearTimeout(this.restoreScrollTimeout);
		}

		this.restoreScrollTimeout = setTimeout(this.restore.bind(this), delayMs);
	}
}

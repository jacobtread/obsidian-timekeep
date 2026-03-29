import type { App, Command } from "obsidian";

import moment from "moment";
import { Notice } from "obsidian";

import { stopFileTimekeeps } from "@/timekeep/stopFileTimekeeps";
import { getErrorMessage } from "@/utils/error";

async function asyncCallback(app: App) {
	const currentTime = moment();
	const currentFile = app.workspace.activeEditor?.file ?? null;

	if (currentFile === null) {
		new Notice("No active file detected", 1500);
		return;
	}

	try {
		const totalStopped = await stopFileTimekeeps(app.vault, currentFile, currentTime);

		if (totalStopped < 1) {
			new Notice("Nothing to stop.", 1500);
			return;
		}

		new Notice(`Stopped ${totalStopped} tracker${totalStopped !== 1 ? "s" : ""}`, 1500);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		new Notice("Failed to stop timekeeps: " + errorMessage, 1500);
	}
}

export default function (app: App): Command {
	return {
		id: `stop-current-timekeeps`,
		name: `Stop All Running Trackers (Current File Only)`,
		callback: () => void asyncCallback(app),
	};
}

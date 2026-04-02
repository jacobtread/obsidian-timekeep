import type { App, Command } from "obsidian";

import moment from "moment";
import { Notice } from "obsidian";

import { stopAllTimekeeps } from "@/timekeep/stopAllTimekeeps";
import { getErrorMessage } from "@/utils/error";

async function asyncCallback(app: App) {
	const currentTime = moment();

	try {
		const totalStopped = await stopAllTimekeeps(app.vault, currentTime);
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
		id: `stop-all-timekeeps`,
		name: `Stop All Running Trackers`,
		callback: () => asyncCallback(app),
	};
}

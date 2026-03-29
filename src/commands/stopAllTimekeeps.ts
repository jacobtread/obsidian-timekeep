import type { App, Command } from "obsidian";

import moment from "moment";
import { Notice } from "obsidian";

import { stopAllTimekeeps } from "@/timekeep/stopAllTimekeeps";

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
		let errorMessage = "";
		if (error instanceof Error) {
			errorMessage = error.message;
		} else if (typeof error === "string") {
			errorMessage = error;
		} else {
			errorMessage = "Unknown error occurred";
		}

		new Notice("Failed to stop timekeeps: " + errorMessage, 1500);
	}
}

export default function (app: App): Command {
	return {
		id: `stop-all-timekeeps`,
		name: `Stop All Running Trackers`,
		callback: () => void asyncCallback(app),
	};
}

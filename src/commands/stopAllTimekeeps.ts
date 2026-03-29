import moment from "moment";
import { Notice, type App, type Command } from "obsidian";

import { stopFileTimekeeps } from "@/timekeep/stopFileTimekeeps";

export default function (app: App): Command {
	return {
		id: `stop-current-timekeeps`,
		name: `Stop All Running Trackers (Current File Only)`,
		callback: () => {
			const currentTime = moment();
			const currentFile = app.workspace.activeEditor?.file ?? null;

			if (currentFile === null) {
				new Notice("No active file detected", 1500);
				return;
			}

			stopFileTimekeeps(app.vault, currentFile, currentTime)
				.then((totalStopped) => {
					if (totalStopped < 1) {
						new Notice("Nothing to stop.", 1500);
						return;
					}

					new Notice(
						`Stopped ${totalStopped} tracker${totalStopped !== 1 ? "s" : ""}`,
						1500
					);
				})
				.catch((error) => {
					let errorMessage = "";
					if (error instanceof Error) {
						errorMessage = error.message;
					} else if (typeof error === "string") {
						errorMessage = error;
					} else {
						error = "Unknown error occurred";
					}

					new Notice("Failed to stop timekeeps: " + errorMessage, 1500);
				});
		},
	};
}

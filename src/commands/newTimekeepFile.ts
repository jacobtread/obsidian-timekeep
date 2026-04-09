import { App, Command } from "obsidian";

import { createNewTimekeepFile } from "@/timekeep/createNewTimekeepFile";

export default function (app: App): Command {
	return {
		id: "new-timekeep-file",
		name: `Create new timekeep file`,
		callback: () => createNewTimekeepFile(app, app.vault.getRoot()),
	};
}

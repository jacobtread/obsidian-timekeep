import { App, Command } from "obsidian";

import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";
import { TimekeepMergerModal } from "@/views/timekeep-merger-modal";

export default function (app: App, settings: Store<TimekeepSettings>): Command {
	return {
		id: `export-merged-pdf`,
		name: `Export Merged Tracker PDF`,
		callback: () => new TimekeepMergerModal(app, settings, true).open(),
	};
}

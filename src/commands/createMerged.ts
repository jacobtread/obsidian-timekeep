import { App, Command } from "obsidian";

import { TimekeepMergerModal } from "@/modals/TimekeepMergerModal";
import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";

export default function (app: App, settings: Store<TimekeepSettings>): Command {
	return {
		id: `create-merged`,
		name: `Create Merged Tracker`,
		callback: () => new TimekeepMergerModal(app, settings, false).open(),
	};
}

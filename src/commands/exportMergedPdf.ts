import { App, Command } from "obsidian";

import { TimekeepMergerModal } from "@/modals/TimekeepMergerModal";
import { TimekeepRegistry } from "@/service/registry";
import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";

export default function (
	app: App,
	registry: TimekeepRegistry,
	settings: Store<TimekeepSettings>
): Command {
	return {
		id: `export-merged-pdf`,
		name: `Export Merged Tracker PDF`,
		callback: () => new TimekeepMergerModal(app, registry, settings, true).open(),
	};
}

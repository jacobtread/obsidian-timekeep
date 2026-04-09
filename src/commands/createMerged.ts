import { App, Command } from "obsidian";

import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";

import { TimekeepMergerModal } from "@/modals/TimekeepMergerModal";

import { TimekeepRegistry } from "@/service/registry";

export default function (
	app: App,
	registry: TimekeepRegistry,
	settings: Store<TimekeepSettings>
): Command {
	return {
		id: `create-merged`,
		name: `Create Merged Tracker`,
		callback: () => new TimekeepMergerModal(app, registry, settings, false).open(),
	};
}

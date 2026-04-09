import { App, Command } from "obsidian";

import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";

import { TimekeepLocatorModal } from "@/modals/TimekeepLocatorModal";

import { TimekeepRegistry } from "@/service/registry";

export default function (
	app: App,
	registry: TimekeepRegistry,
	settings: Store<TimekeepSettings>
): Command {
	return {
		id: `find`,
		name: `Find running trackers`,
		callback: () => new TimekeepLocatorModal(app, registry, settings).open(),
	};
}

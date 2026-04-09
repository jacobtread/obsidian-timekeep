import { App, Command } from "obsidian";

import { TimekeepLocatorModal } from "@/modals/TimekeepLocatorModal";

export default function (app: App): Command {
	return {
		id: `find`,
		name: `Find running trackers`,
		callback: () => new TimekeepLocatorModal(app).open(),
	};
}

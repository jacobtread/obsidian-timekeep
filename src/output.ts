import { Moment } from "moment";

import { Timekeep } from "./timekeep/schema";
import { TimekeepSettings } from "./settings";

export interface CustomOutputFormat {
	/**
	 * Get the label to display on the export button
	 * in the user interface
	 */
	getButtonLabel(): string;

	/**
	 * Handle exporting with the custom output format
	 *
	 * @param timekeep The timekeep to export
	 * @param settings The timekeep settings
	 * @param currentTime The current time to use for unfinished entries
	 */
	onExport(
		timekeep: Timekeep,
		settings: TimekeepSettings,
		currentTime: Moment
	): void;
}

import { moment } from "obsidian";
import { TimekeepSettings } from "./settings";

export function isEmptyString(value: string): boolean {
	return value.trim().length === 0;
}

export function formatTimestamp(
	timestamp: moment.Moment,
	settings: TimekeepSettings
): string {
	return moment(timestamp).format(settings.timestampFormat);
}

export function formatEditableTimestamp(
	timestamp: moment.Moment | string,
	settings: TimekeepSettings
): string {
	return moment(timestamp).format(settings.editableTimestampFormat);
}

export function unformatEditableTimestamp(
	formatted: string,
	settings: TimekeepSettings
): moment.Moment {
	return moment(formatted, settings.editableTimestampFormat, true);
}

export function formatDuration(totalTime: number): string {
	let ret = "";
	const duration = moment.duration(totalTime);
	const hours = Math.floor(duration.asHours());

	if (hours > 0) ret += hours + "h ";
	if (duration.minutes() > 0) ret += duration.minutes() + "m ";
	ret += duration.seconds() + "s";

	return ret;
}

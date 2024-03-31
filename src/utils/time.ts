import moment, { Moment } from "moment";
import { TimekeepSettings } from "@/settings";

export function formatTimestamp(
	timestamp: Moment,
	settings: TimekeepSettings
): string {
	return timestamp.format(settings.timestampFormat);
}

export function formatEditableTimestamp(
	timestamp: Moment,
	settings: TimekeepSettings
): string {
	return timestamp.format(settings.editableTimestampFormat);
}

export function unformatEditableTimestamp(
	formatted: string,
	settings: TimekeepSettings
): Moment {
	return moment(formatted, settings.editableTimestampFormat, true);
}

export function formatDuration(totalTime: number): string {
	let ret = "";
	const duration = moment.duration(totalTime);
	const hours = Math.floor(duration.asHours());

	if (hours > 0) ret += hours + "h ";
	if (duration.minutes() > 0) ret += duration.minutes() + "m ";
	ret += duration.seconds() + "s";

	return ret.trim();
}

export function formatDurationHoursTrunc(totalTime: number): string {
	const duration = moment.duration(totalTime);

	const hours = duration.asHours();

	return hours.toFixed(2) + "h";
}

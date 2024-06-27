import moment, { Moment } from "moment";
import { TimekeepSettings } from "@/settings";

/**
 * Formats a timestamp for tables and generated output
 *
 * @param timestamp The timestamp to format
 * @param settings The timekeep settings
 * @returns The formatted timestamp
 */
export function formatTimestamp(
	timestamp: Moment,
	settings: TimekeepSettings
): string {
	return timestamp.format(settings.timestampFormat);
}

/**
 * Formats the provided timestamp in the way its expected to be
 * edited by the user
 *
 * @param timestamp The timestamp to format
 * @param settings The timekeep settings
 * @returns The formatted timestamp
 */
export function formatEditableTimestamp(
	timestamp: Moment,
	settings: TimekeepSettings
): string {
	return timestamp.format(settings.editableTimestampFormat);
}

/**
 * Converts the user edited format back into a timestamp
 *
 * @param formatted The user edited formatted timestamp
 * @param settings The timekeep settings
 * @returns The timestamp
 */
export function parseEditableTimestamp(
	formatted: string,
	settings: TimekeepSettings
): Moment {
	return moment(formatted, settings.editableTimestampFormat, true);
}

/**
 * Formats the provided duration in the form
 * of hours, minutes, and seconds
 *
 * @param totalTime The duration to format
 * @returns The formatted duration
 */
export function formatDuration(totalTime: number): string {
	let ret = "";
	const duration = moment.duration(totalTime);
	const hours = Math.floor(duration.asHours());

	if (hours > 0) ret += hours + "h ";
	if (duration.minutes() > 0) ret += duration.minutes() + "m ";
	ret += duration.seconds() + "s";

	return ret.trim();
}

/**
 * Formats a duration in the form of hours only
 * minutes will be counted a portions of an hour
 * (i.e 1h 30m will be 1.5h)
 *
 * @param totalTime The duration to format
 * @returns The formatted duration
 */
export function formatDurationHoursTrunc(totalTime: number): string {
	const duration = moment.duration(totalTime);

	const hours = duration.asHours();

	return hours.toFixed(2) + "h";
}

/**
 * Formats the pdf date field using the date format set in
 * the provided settings
 *
 * @param value The moment value to format
 * @param settings The settings
 * @returns The formatted date
 */
export function formatPdfDate(
	value: Moment,
	settings: TimekeepSettings
): string {
	return value.format(settings.pdfDateFormat);
}

/**
 * Formats the timestamp field for each individual row
 * in a exported pdf using the provided settings for
 * the format
 *
 * @param value The moment value to format
 * @param settings The settings
 * @returns The formatted timestamp
 */
export function formatPdfRowDate(
	value: Moment,
	settings: TimekeepSettings
): string {
	return value.format(settings.pdfRowDateFormat);
}

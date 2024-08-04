import moment, { Moment } from "moment";
import { DurationFormat, TimekeepSettings } from "@/settings";

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
 * Formats a duration using the provided duration format
 *
 * @param format The format to use
 * @param durationMS The duration to format
 * @returns The formatted duration
 */
export function formatDuration(
	format: DurationFormat,
	durationMS: number
): string {
	switch (format) {
		case DurationFormat.LONG:
			return formatDurationLong(durationMS);
		case DurationFormat.SHORT:
			return formatDurationShort(durationMS);
		case DurationFormat.DECIMAL:
			return formatDurationDecimal(durationMS);
	}
}

/**
 * Formats the provided duration in the form
 * of hours, minutes, and seconds
 *
 * @param durationMS The duration to format in milliseconds
 * @returns The formatted duration
 */
export function formatDurationLong(durationMS: number): string {
	let ret = "";
	const duration = moment.duration(durationMS);
	const hours = Math.floor(duration.asHours());

	if (hours > 0) ret += hours + "h ";
	if (duration.minutes() > 0) ret += duration.minutes() + "m ";
	ret += duration.seconds() + "s";

	return ret.trim();
}

/**
 * Same as {@see formatDurationDecimal} but with a "h" suffix
 * indicating its hours
 *
 * @param durationMS The duration to format in milliseconds
 * @returns The formatted duration
 */
export function formatDurationShort(durationMS: number): string {
	return formatDurationDecimal(durationMS) + "h";
}

/**
 * Formats a duration in the form of hours only
 * minutes will be counted a portions of an hour
 * (i.e 1h 30m will be 1.5)
 *
 * @param durationMS The duration to format
 * @returns The formatted duration
 */
export function formatDurationDecimal(durationMS: number): string {
	const duration = moment.duration(durationMS);

	const hours = duration.asHours();

	return hours.toFixed(2);
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

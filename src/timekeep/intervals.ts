import type { TimeEntry } from "@/timekeep/schema";

export function hasInvalidSameDayMeridiem(
	startTime: moment.Moment,
	endTime: moment.Moment
): boolean {
	return startTime.isSame(endTime, "day") && (startTime.hour() < 12) !== (endTime.hour() < 12);
}

export function hasEntryOverlap(
	entry: TimeEntry,
	entries: TimeEntry[],
	toleranceMinutes: number,
	currentTime: moment.Moment
): boolean {
	if (entry.subEntries !== null || entry.startTime === null) return false;

	const entryEnd = entry.endTime ?? currentTime;
	const tolerance = Math.max(0, toleranceMinutes) * 60 * 1000;
	return entries.some((other) => {
		if (other.id === entry.id || other.subEntries !== null || other.startTime === null) {
			return false;
		}

		const otherEnd = other.endTime ?? currentTime;
		const overlap = Math.min(entryEnd.valueOf(), otherEnd.valueOf()) -
			Math.max(entry.startTime.valueOf(), other.startTime.valueOf());
		return overlap >= tolerance && overlap > 0;
	});
}

export function withGapEntries(entries: TimeEntry[]): TimeEntry[] {
	const result: TimeEntry[] = [];
	for (let index = 0; index < entries.length; index += 1) {
		const current = entries[index];
		const previous = entries[index - 1];
		if (
			index > 0 &&
			previous?.subEntries === null &&
			current.subEntries === null &&
			previous.endTime !== null &&
			current.startTime !== null &&
			current.startTime.isAfter(previous.endTime)
		) {
			result.push({
				id: -1,
				name: "",
				startTime: null,
				endTime: null,
				subEntries: null,
			});
		}
		result.push(current);
	}
	return result;
}

import { TimekeepSettings, defaultSettings } from "@/settings";
import {
	formatDuration,
	formatDurationHoursTrunc,
	formatEditableTimestamp,
	formatTimestamp,
	unformatEditableTimestamp,
} from "./time";
import moment from "moment";

it("should format time", () => {
	const input = moment("2024-03-31T02:34:45.413Z").utc();
	const expected = "24-03-31 02:34:45";

	const settings: TimekeepSettings = defaultSettings;
	settings.timestampFormat = "YY-MM-DD HH:mm:ss";

	const output = formatTimestamp(input, settings);

	expect(output).toBe(expected);
});

it("should format editable time", () => {
	const input = moment("2024-03-31T02:34:45.413Z").utc();
	const expected = "2024-03-31 02:34:45";

	const settings: TimekeepSettings = defaultSettings;
	settings.editableTimestampFormat = "YYYY-MM-DD HH:mm:ss";

	const output = formatEditableTimestamp(input, settings);

	expect(output).toBe(expected);
});

it("should unformat editable time", () => {
	const input = "2024-03-31 15:34:45";
	const expected = moment("2024-03-31T02:34:45.000Z").utc();

	const settings: TimekeepSettings = defaultSettings;
	settings.editableTimestampFormat = "YYYY-MM-DD HH:mm:ss";

	const output = unformatEditableTimestamp(input, settings).utc();

	expect(output.toISOString()).toBe(expected.toISOString());
});

describe("format duration", () => {
	test.each([
		[1000, "1s"],
		[1000 * 12, "12s"],
		[1000 * 60, "1m 0s"],
		[1000 * 60 * 2, "2m 0s"],
		[1000 * 60 * 60 * 2, "2h 0s"],
		[1000 * 60 * 60 * 2.5, "2h 30m 0s"],
		[1000 * 60 * 60 * 2.505, "2h 30m 18s"],
	])(
		'for duration "%s" should expected formatted "%s"',
		(input, expected) => {
			const output = formatDuration(input);

			expect(output).toBe(expected);
		}
	);
});

describe("format duration short", () => {
	test.each([
		[1000 * 60 * 60 * 2, "2.00h"],
		[1000 * 60 * 60 * 25.25, "25.25h"],
		[1000 * 60 * 60 * 25.255, "25.25h"],
		[1000 * 60 * 60 * 50.5, "50.50h"],
	])(
		'for duration "%s" should expected formatted "%s"',
		(input, expected) => {
			const output = formatDurationHoursTrunc(input);

			expect(output).toBe(expected);
		}
	);
});

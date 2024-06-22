import moment from "moment";
import { defaultSettings, TimekeepSettings } from "@/settings";

import {
	formatDate,
	formatDuration,
	formatDateTime,
	formatTimestamp,
	parseEditableTimestamp,
	formatEditableTimestamp,
	formatDurationHoursTrunc,
} from "./time";

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
	const input = "2024-03-31 02:34:45";
	const expected = moment("2024-03-31 02:34:45", "YYYY-MM-DD HH:mm:ss");

	const settings: TimekeepSettings = defaultSettings;
	settings.editableTimestampFormat = "YYYY-MM-DD HH:mm:ss";

	const output = parseEditableTimestamp(input, settings).utc();

	expect(output.toDate()).toStrictEqual(expected.toDate());
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

describe("format date", () => {
	test.each([
		["2024-03-31 02:34:45", "31/03/2024"],
		["2024-02-29 02:34:45", "29/02/2024"],
		["2024-01-12 02:34:45", "12/01/2024"],
		["2024-01-12 02:34:45", "12/01/2024"],
		["2024-09-24 02:34:45", "24/09/2024"],
		["2023-09-24 02:34:45", "24/09/2023"],
	])('for date "%s" should expected formatted "%s"', (input, expected) => {
		const output = formatDate(moment(input));

		expect(output).toBe(expected);
	});
});

describe("format date time", () => {
	test.each([
		["2024-03-31 02:34:45", "31/03/2024 02:34"],
		["2024-02-29 08:34:45", "29/02/2024 08:34"],
		["2024-01-12 12:34:45", "12/01/2024 12:34"],
		["2024-01-12 14:34:45", "12/01/2024 14:34"],
		["2024-09-24 18:34:45", "24/09/2024 18:34"],
		["2023-09-24 20:34:45", "24/09/2023 20:34"],
	])(
		'for date time "%s" should expected formatted "%s"',
		(input, expected) => {
			const output = formatDateTime(moment(input));

			expect(output).toBe(expected);
		}
	);
});

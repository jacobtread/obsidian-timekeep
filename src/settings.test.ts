import {
	SortOrder,
	DurationFormat,
	defaultSettings,
	TimekeepSettings,
	legacySettingsCompatibility,
} from "./settings";
import { expect, test, describe } from "vitest";

describe("legacy settings compatibility conversion", () => {
	test("Empty setting", () => {
		// Checking the legacySettingsCompatibility does not add any settings without existing legacy settings
		const setting = {};
		const expected = {};
		legacySettingsCompatibility(setting as TimekeepSettings);
		expect(setting).toStrictEqual(expected);
	});

	test("Default setting", () => {
		// Checking the default setting does not contain any legacy settings
		const setting = Object.assign({}, defaultSettings);
		legacySettingsCompatibility(setting);
		expect(setting).toStrictEqual(defaultSettings);
	});

	test.each([
		[
			{ reverseSegmentOrder: true },
			{ sortOrder: SortOrder.REVERSE_INSERTION },
		],
		[{ reverseSegmentOrder: false }, { sortOrder: SortOrder.INSERTION }],
		[
			{ showDecimalHours: true },
			{ secondaryDurationFormat: DurationFormat.SHORT },
		],
		[
			{ showDecimalHours: false },
			{ secondaryDurationFormat: DurationFormat.NONE },
		],
	])('for "%s" should expected "%s"', (legacySetting, expected) => {
		// Check the legacy setting gets replaced with the new setting
		const partialSetting = Object.assign(
			{},
			legacySetting
		) as TimekeepSettings;
		legacySettingsCompatibility(partialSetting);
		expect(partialSetting).toStrictEqual(expected);

		const setting = Object.assign({}, defaultSettings, legacySetting);
		legacySettingsCompatibility(setting);
		expect(setting).toStrictEqual(
			Object.assign({}, defaultSettings, expected)
		);
	});
});

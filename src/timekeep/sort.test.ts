import {
	SortOrder,
	UnstartedOrder,
	defaultSettings,
	TimekeepSettings,
} from "@/settings";

import { getEntriesSorted } from "./sort";

describe("getEntriesSorted", () => {
	it("should be in reverse order", async () => {
		const { input, expected } = await import(
			"./__fixtures__/ordering/reverseOrder"
		);

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.REVERSE_INSERTION;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});

	it("should be in newest first order", async () => {
		const { input, expected } = await import(
			"./__fixtures__/ordering/newestFirstOrder"
		);

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.NEWEST_START;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});

	it("should be in newest last order", async () => {
		const { input, expected } = await import(
			"./__fixtures__/ordering/newestLastOrder"
		);

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.OLDEST_START;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});

	it("should be in newest last order with nulls first", async () => {
		const { input, expected } = await import(
			"./__fixtures__/ordering/newestLastNullsFirst"
		);

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.OLDEST_START;
		settings.unstartedOrder = UnstartedOrder.FIRST;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});

	it("order should not change", async () => {
		const { input, expected } = await import(
			"./__fixtures__/ordering/orderShouldNotChange"
		);

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.INSERTION;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});
});

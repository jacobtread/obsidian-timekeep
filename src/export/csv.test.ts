import moment from "moment";
import { v4 } from "uuid";
import { describe, expect, it } from "vitest";

import { defaultSettings } from "@/settings";

import { createCSV } from "./csv";

describe("createCSV", () => {
	it("should create entry table rows", () => {
		const start = moment("2020-01-01T00:00:00Z");
		const entries = [
			{
				id: v4(),
				name: "Test",
				startTime: moment(start),
				endTime: moment(start).add(1, "hour"),
				subEntries: null,
			},
			{
				id: v4(),
				name: "Test 2",
				startTime: moment(start),
				endTime: moment(start).add(2, "hour"),
				subEntries: null,
			},
		];

		const csv = createCSV({ entries }, defaultSettings, start);
		expect(csv).toEqual(`Block,Start Time,End time,Duration
Test,20-01-01 13:00:00,20-01-01 14:00:00,1.00h
Test 2,20-01-01 13:00:00,20-01-01 15:00:00,2.00h`);
	});

	it("should flatten group entries", () => {
		const start = moment("2020-01-01T00:00:00Z");
		const entries = [
			{
				id: v4(),
				name: "Test",
				startTime: moment(start),
				endTime: moment(start).add(1, "hour"),
				subEntries: null,
			},
			{
				id: v4(),
				name: "Test 2",
				startTime: moment(start),
				endTime: moment(start).add(2, "hour"),
				subEntries: null,
			},
			{
				id: v4(),
				name: "Test Group",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: v4(),
						name: "Test 3",
						startTime: moment(start),
						endTime: moment(start).add(2, "hour"),
						subEntries: null,
					},
				],
			},
		];

		const csv = createCSV({ entries }, defaultSettings, start);
		expect(csv).toEqual(`Block,Start Time,End time,Duration
Test,20-01-01 13:00:00,20-01-01 14:00:00,1.00h
Test 2,20-01-01 13:00:00,20-01-01 15:00:00,2.00h
Test Group,,,2.00h
Test 3,20-01-01 13:00:00,20-01-01 15:00:00,2.00h`);
	});

	it("should use current time for unfinished entries", () => {
		const start = moment("2020-01-01T00:00:00Z");
		const currentTime = moment(start).add(2, "hour");
		const entries = [
			{
				id: v4(),
				name: "Test",
				startTime: moment(start),
				endTime: moment(start).add(1, "hour"),
				subEntries: null,
			},
			{
				id: v4(),
				name: "Test 2",
				startTime: moment(start),
				endTime: moment(start).add(2, "hour"),
				subEntries: null,
			},
			{
				id: v4(),
				name: "Test Group",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: v4(),
						name: "Test 3",
						startTime: moment(start),
						endTime: null,
						subEntries: null,
					},
				],
			},
		];

		const csv = createCSV({ entries }, defaultSettings, currentTime);
		expect(csv).toEqual(`Block,Start Time,End time,Duration
Test,20-01-01 13:00:00,20-01-01 14:00:00,1.00h
Test 2,20-01-01 13:00:00,20-01-01 15:00:00,2.00h
Test Group,,,2.00h
Test 3,20-01-01 13:00:00,20-01-01 15:00:00,2.00h`);
	});
});

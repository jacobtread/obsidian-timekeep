import type { Moment } from "moment";
import type { Content, DynamicContent, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";

import pdfMake from "pdfmake";

import type { TimekeepSettings } from "@/settings";

import { NameSegmentType, parseNameSegments } from "@/utils/name";
import {
	formatDurationLong,
	formatDurationShort,
	formatPdfDate,
	formatPdfRowDate,
} from "@/utils/time";

import { getEntryDuration, getTotalDuration } from "@/timekeep/queries";
import type { TimeEntry, Timekeep } from "@/timekeep/schema";

/**
 * Create the definition for rendering a timekeep PDF
 *
 * @param timekeep The timekeep to create the definition for
 * @param settings The timekeep settings
 * @param currentTime The current time
 * @returns The timekeep PDF definition
 */
export function createPdfDefinition(
	timekeep: Timekeep,
	settings: TimekeepSettings,
	currentTime: Moment
): TDocumentDefinitions {
	const duration = getTotalDuration(timekeep.entries, currentTime);
	const currentDate = formatPdfDate(currentTime, settings);
	const totalDuration = formatDurationLong(duration);
	const totalDurationShort = formatDurationShort(duration);

	return {
		content: [
			createPdfHeader(settings.pdfTitle, currentDate, totalDuration, totalDurationShort),
			createPdfTable(timekeep, totalDuration, settings, currentTime),
		],
		footer: createPdfFooter(settings),
		defaultStyle: {
			font: settings.pdfFontFamily,
		},
		pageSize: "A4",
		pageMargins: 15,
		styles: {
			heading: {
				marginBottom: 5,
				columnGap: 10,
			},
			title: {
				bold: true,
				fontSize: 12,
				marginBottom: 5,
			},
			details: {
				marginBottom: 5,
			},
			footNote: {
				noWrap: true,
				fontSize: 6,
				bold: true,
			},
			pageNumber: {
				noWrap: true,
				fontSize: 6,
			},
			footer: {
				marginLeft: 15,
				marginRight: 15,
			},
			tableCell: {
				fontSize: 8,
			},
			tableCellTime: {
				alignment: "right",
			},
			tableCellHeader: {
				bold: true,
			},
		},
	};
}

/**
 * Create the PDF header definition for the heading of the PDF
 *
 * @param pdfTitle Title to use in the PDF
 * @param currentDate The current date for the PDF
 * @param totalDuration The total timekeep duration
 * @param totalDurationShort The total timekeep duration in short format
 * @returns The header content definition
 */
function createPdfHeader(
	pdfTitle: string,
	currentDate: string,
	totalDuration: string,
	totalDurationShort: string
): pdfMake.Content {
	const detail = (title: string, value: string): pdfMake.Content => ({
		text: [
			{ text: title + ": ", fontSize: 8, bold: true },
			{ text: value, fontSize: 8 },
		],
		marginBottom: 8,
	});

	return [
		{
			columns: [
				{
					text: pdfTitle,
					alignment: "left",
					style: "title",
					width: "50%",
				},
				{
					text: "Timesheet",
					alignment: "right",
					style: "title",
					width: "50%",
				},
			],
			style: "heading",
		},
		{
			stack: [
				detail("Date", currentDate),
				detail("Total Duration", totalDuration),
				detail("Total Duration (hours)", totalDurationShort),
			],

			style: "details",
		},
	];
}

/**
 * Creates the timekeep PDF table
 *
 * @param timekeep The timekeep to create the table for
 * @param totalDuration The total duration of all timekeep entries
 * @param settings The timekeep settings
 * @param currentTime The current time
 * @returns The table definition
 */
function createPdfTable(
	timekeep: Timekeep,
	totalDuration: string,
	settings: TimekeepSettings,
	currentTime: Moment
): pdfMake.Content {
	const rows = createPdfTableRows(timekeep.entries, settings, currentTime);

	const cellPadding = () => 8;

	return {
		table: {
			headerRows: 1,
			widths: ["*", 70, 70, 50],
			body: [
				[
					{
						text: "Block Name",
						style: ["tableCell", "tableCellHeader"],
						border: [true, false, false, true],
					},
					{
						text: "Start Time",
						style: ["tableCell", "tableCellHeader"],
						alignment: "center",
						border: [false, false, false, true],
					},
					{
						text: "End Time",
						style: ["tableCell", "tableCellHeader"],
						alignment: "center",
						border: [false, false, false, true],
					},
					{
						text: "Duration",
						style: ["tableCell", "tableCellHeader"],
						alignment: "right",
						border: [false, false, true, true],
					},
				],
				...rows.map((row) => row.row),
				[
					{ text: "Total", style: "tableCell" },
					{ text: "", style: "tableCell" },
					{ text: "", style: "tableCell" },
					{
						text: totalDuration,
						style: ["tableCell", "tableCellFooter"],
						bold: true,
						alignment: "right",
					},
				],
			],
		},

		layout: {
			fillColor: function (rowIndex, _node, _columnIndex) {
				// Header & Footer styling
				if (rowIndex === 0 || rowIndex === rows.length + 1) {
					return "#ececec";
				}

				// Group row styling
				if (rowIndex > 0 && rowIndex - 1 < rows.length) {
					if (rows[rowIndex - 1].group) {
						return "#f4f4f4";
					}
				}

				// Default styling
				return "#ffffff";
			},

			vLineColor: "#ececec",
			hLineColor: "#ececec",
			paddingBottom: cellPadding,
			paddingLeft: cellPadding,
			paddingTop: cellPadding,
			paddingRight: cellPadding,
		},
	};
}

/**
 * Rendered row within the table with additional describing metadata
 */
type TableEntryRow = {
	/** The row cells content */
	row: TableCell[];
	/** Nesting depth of the row */
	depth: number;
	/** Whether the row is a group of entries */
	group: boolean;
};

/**
 * Creates the collection of timekeep entry table rows from the
 * provided entries
 *
 * @param entries The entries to create rows from
 * @param settings The timekeep settings
 * @param currentTime The current time
 * @returns The created rows
 */
function createPdfTableRows(
	entries: TimeEntry[],
	settings: TimekeepSettings,
	currentTime: Moment
): TableEntryRow[] {
	type StackEntry = { entry: TimeEntry; depth: number };

	const rows: TableEntryRow[] = [];
	const stack: StackEntry[] = entries.map((entry) => ({ entry, depth: 0 }));

	while (stack.length > 0) {
		const { entry, depth } = stack.pop()!;

		rows.push({
			group: entry.subEntries !== null && entry.subEntries.length > 0,
			row: createTableEntryCells(entry, depth, settings, currentTime),
			depth,
		});

		if (entry.subEntries && entry.subEntries.length > 0) {
			for (let i = entry.subEntries.length - 1; i >= 0; i--) {
				stack.push({
					entry: entry.subEntries[i],
					depth: depth + 1,
				});
			}
		}
	}

	return rows;
}

/**
 * Create the content for a table entry name ensuring
 * links are marked as links
 *
 * @param name The name to parse and turn into content
 * @returns The entry name content
 */
function createTableEntryName(name: string): Content {
	const segments = parseNameSegments(name);
	const content: Content = [];

	for (const segment of segments) {
		switch (segment.type) {
			case NameSegmentType.Text:
				content.push(segment.text);
				break;

			case NameSegmentType.Link:
				content.push({
					link: segment.url,
					text: segment.text,
				});
				break;
		}
	}

	return content;
}

/**
 * Create the definition for the table cells of an entry
 *
 * @param entry The entry
 * @param depth The nesting depth of the entry
 * @param settings The timekeep settings
 * @param currentTime The current time to use for unfinished entries
 * @returns The table cells definitions
 */
function createTableEntryCells(
	entry: TimeEntry,
	depth: number,
	settings: TimekeepSettings,
	currentTime: Moment
): TableCell[] {
	const duration = getEntryDuration(entry, currentTime);
	const durationFormatted = formatDurationLong(duration);

	let startTime: string;
	let endTime: string;

	if (entry.startTime !== null) {
		startTime = formatPdfRowDate(entry.startTime, settings);
		endTime = formatPdfRowDate(entry.endTime ?? currentTime, settings);
	} else {
		startTime = "";
		endTime = "";
	}

	const marginLeft = depth * 5;

	return [
		{
			text: createTableEntryName(entry.name),
			style: ["tableCell", "tableCellBlock"],
			marginLeft,
			border: [true, false, false, true],
		},
		{
			text: startTime,
			style: ["tableCell", "tableCellTime"],
			alignment: "center",
		},
		{
			text: endTime,
			style: ["tableCell", "tableCellTime"],
			alignment: "center",
		},
		{
			text: durationFormatted,
			style: ["tableCell", "tableCellTime"],
			alignment: "right",
			border: [false, false, true, true],
		},
	];
}

/**
 * Create the footer that should appear on
 * every page of the exported PDF
 *
 * @param settings The timekeep settings
 * @returns The footer content factory
 */
function createPdfFooter(settings: TimekeepSettings): DynamicContent {
	return function (currentPage: number, pageCount: number) {
		return {
			columns: [
				{
					text: `${settings.pdfFootnote}`,
					style: "footNote",
					width: "50%",
					alignment: "left",
				},
				{
					text: `${currentPage} of ${pageCount}`,
					style: "pageNumber",
					width: "50%",
					alignment: "right",
				},
			],
			style: "footer",
		};
	};
}

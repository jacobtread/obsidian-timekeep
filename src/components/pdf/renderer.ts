import type { TimeEntry, Timekeep } from "@/timekeep/schema";
import type { TimekeepSettings } from "@/settings";
import type { Moment } from "moment";

import pdfMake from "pdfmake";
import type {
    DynamicContent,
    Table,
    TableCell,
    TDocumentDefinitions,
    TFontDictionary,
} from "pdfmake/interfaces";

// Embedded fonts
import RobotoBold from "@/fonts/Roboto-Bold.ttf";
import RubikRegular from "@/fonts/Rubik-Regular.ttf";
import RubikBold from "@/fonts/Rubik-Bold.ttf";
import RobotoRegular from "@/fonts/Roboto-Regular.ttf";
import { getEntryDuration, getTotalDuration } from "@/timekeep";
import {
    formatDurationLong,
    formatDurationShort,
    formatPdfDate,
    formatPdfRowDate,
} from "@/utils";
import { Readable } from "stream";

const fonts: TFontDictionary = {
    Roboto: {
        normal: "Roboto-Regular.ttf",
        bold: "Roboto-Bold.ttf",
    },
    Rubik: {
        normal: "Rubik-Regular.ttf",
        bold: "Rubik-Bold.ttf",
    },
};

function stripDataUrlPrefix(text: string): string {
    return text.substring("data:font/ttf;base64,".length);
}

pdfMake.addVirtualFileSystem({
    "Roboto-Regular.ttf": stripDataUrlPrefix(RobotoRegular),
    "Roboto-Bold.ttf": stripDataUrlPrefix(RobotoBold),
    "Rubik-Regular.ttf": stripDataUrlPrefix(RubikRegular),
    "Rubik-Bold.ttf": stripDataUrlPrefix(RubikBold),
});

pdfMake.addFonts(fonts);

export async function createPdfExport(
    timekeep: Timekeep,
    settings: TimekeepSettings,
    currentTime: Moment
): Promise<NodeJS.ReadableStream> {
    const definition = createPdfDefinition(timekeep, settings, currentTime);
    const pdf = pdfMake.createPdf(definition, {});
    const stream = await pdf.getBuffer();
    return Readable.from([stream]);
}

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
            createPdfHeader(
                settings.pdfTitle,
                currentDate,
                totalDuration,
                totalDurationShort
            ),
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

function createPdfHeader(
    pdfTitle: string,
    currentDate: string,
    totalDuration: string,
    totalDurationShort: string
): pdfMake.Content {
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
                createPdfHeaderDetailField("Date", currentDate),
                createPdfHeaderDetailField("Total Duration", totalDuration),
                createPdfHeaderDetailField(
                    "Total Duration (hours)",
                    totalDurationShort
                ),
            ],

            style: "details",
        },
    ];
}

function createPdfHeaderDetailField(
    title: string,
    value: string
): pdfMake.Content {
    return {
        text: [
            { text: title + ": ", fontSize: 8, bold: true },
            { text: value, fontSize: 8 },
        ],
        marginBottom: 8,
    };
}

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

function createPdfTable(
    timekeep: Timekeep,
    totalDuration: string,
    settings: TimekeepSettings,
    currentTime: Moment
): pdfMake.Content {
    const rows = createPdfTableRows(timekeep.entries, settings, currentTime);

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
            fillColor: function (rowIndex, node, columnIndex) {
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

            vLineColor: function (columnIndex, node, rowIndex) {
                return "#ececec";
            },

            hLineColor: function (rowIndex, node, columnIndex) {
                return "#ececec";
            },
            paddingBottom: cellPadding,
            paddingLeft: cellPadding,
            paddingTop: cellPadding,
            paddingRight: cellPadding,
        },
    };
}

const cellPadding = () => 8;

type TableEntryRow = {
    row: TableCell[];
    depth: number;
    group: boolean;
};

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

    if (depth > 0) {
        const bg = "#999";
    }

    return [
        {
            text: entry.name,
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

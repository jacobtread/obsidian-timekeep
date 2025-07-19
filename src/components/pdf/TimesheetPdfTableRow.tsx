import type { Moment } from "moment";
import React, { Fragment } from "react";
import { getEntryDuration } from "@/timekeep";
import { TimekeepSettings } from "@/settings";
import { TimeEntry } from "@/timekeep/schema";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { formatPdfRowDate, formatDurationLong } from "@/utils";

type Props = {
	entry: TimeEntry;
	currentTime: Moment;
	settings: TimekeepSettings;
};

const styles = StyleSheet.create({
	// Row within the table
	tableRow: {
		flexDirection: "row",
		borderBottomColor: "#ececec",
		borderBottomWidth: 1,
		alignItems: "center",
		height: 24,
		fontSize: 8,
		width: "100%",
	},

	// Wrapper for nested rows
	tableRowWrapper: {
		borderColor: "#f9f9f9",
		borderWidth: 5,
	},

	// Base table cell
	tableCell: {
		padding: 15,
	},

	// Table cell that spans available width
	tableCellBlock: {
		width: "100%",
	},

	// Table cell that contains a timestamp
	tableCellTime: {
		width: "200px",
		textAlign: "right",
	},

	// Table cell that contains a duration
	tableCellDuration: {
		width: "400px",
		textAlign: "right",
		fontWeight: 700,
		fontFamily: "Roboto",
	},

	// Table indentation container
	tableIndent: {
		borderLeftWidth: 5,
		borderLeftColor: "#999",
	},
});

export function TimesheetPdfTableRow({ entry, currentTime, settings }: Props) {
	const duration = getEntryDuration(entry, currentTime);
	const durationFormatted = formatDurationLong(duration);

	// Render start and end timing for individual entries
	const renderTiming = entry.startTime !== null && (
		<>
			<Text style={[styles.tableCell, styles.tableCellTime]}>
				{formatPdfRowDate(entry.startTime, settings)}
			</Text>
			<Text style={[styles.tableCell, styles.tableCellTime]}>
				{formatPdfRowDate(entry.endTime ?? currentTime, settings)}
			</Text>
		</>
	);

	// Render the child rows for groups
	const renderChildren = entry.subEntries != null && (
		<View style={[styles.tableIndent, styles.tableRowWrapper]}>
			{entry.subEntries.map((entry, index) => (
				<TimesheetPdfTableRow
					entry={entry}
					key={index}
					currentTime={currentTime}
					settings={settings}
				/>
			))}
		</View>
	);

	return (
		<Fragment>
			<View style={styles.tableRow} wrap={false}>
				<Text style={[styles.tableCell, styles.tableCellBlock]}>
					{entry.name}
				</Text>
				{renderTiming}
				<Text style={[styles.tableCell, styles.tableCellTime]}>
					{durationFormatted}
				</Text>
			</View>

			{renderChildren}
		</Fragment>
	);
}

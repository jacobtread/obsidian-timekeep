import type { Moment } from "moment";
import React, { Fragment } from "react";
import { getEntryDuration } from "@/timekeep";
import { TimekeepSettings } from "@/settings";
import { View, Text, StyleSheet } from "@/pdf";
import { Timekeep, TimeEntry } from "@/timekeep/schema";
import { formatPdfRowDate, formatDurationLong } from "@/utils";

type Props = {
	data: Timekeep;
	currentTime: Moment;
	totalDuration: string;
	settings: TimekeepSettings;
};

const styles = StyleSheet.create({
	// Container around the timesheet table
	tableContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		borderWidth: 1,
		borderColor: "#ececec",
	},

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

	// Header row
	tableRowHeader: {
		fontFamily: "Roboto",
		fontWeight: 700,
		backgroundColor: "#ececec",
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

export default function TimesheetPdfTable({
	data,
	currentTime,
	totalDuration,
	settings,
}: Props) {
	// Render the table header
	const renderHeader = (
		<View style={[styles.tableRow, styles.tableRowHeader]} wrap={false}>
			<Text style={[styles.tableCell, styles.tableCellBlock]}>
				Block Name
			</Text>
			<Text style={[styles.tableCell, styles.tableCellTime]}>
				Start Time
			</Text>
			<Text style={[styles.tableCell, styles.tableCellTime]}>
				End Time
			</Text>
			<Text style={[styles.tableCell, styles.tableCellTime]}>
				Duration
			</Text>
		</View>
	);

	// Render the rows of the table
	const renderEntries = data.entries.map((entry, index) => (
		<TimesheetPdfTableRow
			entry={entry}
			key={index}
			currentTime={currentTime}
			settings={settings}
		/>
	));

	// Render the table footer
	const renderFooter = (
		<View style={[styles.tableRow, styles.tableRowHeader]} wrap={false}>
			<Text style={[styles.tableCell, styles.tableCellBlock]}>Total</Text>

			<Text style={[styles.tableCell, styles.tableCellTime]} />
			<Text style={[styles.tableCell, styles.tableCellTime]} />

			<Text style={[styles.tableCell, styles.tableCellDuration]}>
				{totalDuration}
			</Text>
		</View>
	);

	return (
		<View style={styles.tableContainer}>
			{renderHeader}
			{renderEntries}
			{renderFooter}
		</View>
	);
}

type RowProps = {
	entry: TimeEntry;
	currentTime: Moment;
	settings: TimekeepSettings;
};

function TimesheetPdfTableRow({ entry, currentTime, settings }: RowProps) {
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

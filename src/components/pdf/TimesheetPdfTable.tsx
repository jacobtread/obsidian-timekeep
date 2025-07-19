import React from "react";
import type { Moment } from "moment";
import { Timekeep } from "@/timekeep/schema";
import { TimekeepSettings } from "@/settings";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

import { TimesheetPdfTableRow } from "./TimesheetPdfTableRow";

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

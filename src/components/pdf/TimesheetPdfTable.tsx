import React from "react";
import type { Moment } from "moment";
import { Timekeep } from "@/timekeep/schema";
import { TimekeepSettings } from "@/settings";
import { View, Text } from "@react-pdf/renderer";

import { Styles } from "./styles";
import { TimesheetPdfTableRow } from "./TimesheetPdfTableRow";

type Props = {
	data: Timekeep;
	currentTime: Moment;
	totalDuration: string;
	settings: TimekeepSettings;
	styles: Styles;
};

export default function TimesheetPdfTable({
	data,
	currentTime,
	totalDuration,
	settings,
	styles,
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
			styles={styles}
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

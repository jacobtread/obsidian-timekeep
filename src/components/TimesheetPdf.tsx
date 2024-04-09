import { Fragment } from "react";
import { Page, Text, View, Document, StyleSheet } from "@/pdf";
import React from "react";

import type { Moment } from "moment";
import { getTotalDuration, getEntryDuration } from "@/timekeep";
import { formatDuration } from "@/utils";
import { Timekeep, TimeEntry } from "@/schema";

type Props = {
	title: string;
	data: Timekeep;
	currentTime: Moment;
};

const styles = StyleSheet.create({
	tableContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		borderWidth: 1,
		borderColor: "#ececec",
	},

	tableRow: {
		flexDirection: "row",
		borderBottomColor: "#ececec",
		borderBottomWidth: 1,
		alignItems: "center",
		height: 24,
		fontStyle: "bold",
		fontSize: 8,
		width: "100%",
	},

	tableRowWrapper: {
		borderColor: "#f9f9f9",
		borderWidth: 5,
	},

	tableRowHeader: {
		fontFamily: "Helvetica-Bold",
		backgroundColor: "#ececec",
	},
	tableCell: {
		padding: 15,
	},

	tableCellBlock: {
		width: "100%",
	},
	tableCellTime: {
		width: "200px",
		textAlign: "right",
	},

	tableCellDuration: {
		width: "400px",
		textAlign: "right",
		fontWeight: "bold",
	},

	tableIndent: {
		borderLeftWidth: 5,
		borderLeftColor: "#999",
	},

	page: {
		padding: 15,
	},

	title: {
		fontFamily: "Helvetica-Bold",
		fontWeight: "bold",
		fontSize: 12,
		marginBottom: 5,
	},

	heading: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 5,
	},

	headingRight: {
		textAlign: "right",
		alignItems: "flex-end",
	},

	details: {
		gap: 4,
		marginBottom: 5,
	},

	detailsFieldName: {
		fontFamily: "Helvetica-Bold",
		fontWeight: "bold",
		fontSize: 8,
		marginBottom: 5,
	},

	detailsField: {
		fontSize: 8,
		marginBottom: 5,
	},

	footNote: {
		marginTop: 10,
		fontSize: 6,
		fontFamily: "Helvetica-Bold",
	},
});

function formatDateTime(value: Moment): string {
	return value.format("DD/MM/YYYY HH:mm");
}

function formatDate(value: Moment): string {
	return value.format("DD/MM/YYYY");
}

function TimesheetEntry({
	entry,
	currentTime,
}: {
	entry: TimeEntry;
	currentTime: Moment;
}) {
	const duration = getEntryDuration(entry, currentTime);

	return (
		<Fragment>
			<View style={styles.tableRow} wrap={false}>
				<Text style={[styles.tableCell, styles.tableCellBlock]}>
					{entry.name}
				</Text>

				{entry.startTime !== null && entry.endTime !== null && (
					<>
						<Text style={[styles.tableCell, styles.tableCellTime]}>
							{entry.startTime
								? formatDateTime(entry.startTime)
								: ""}
						</Text>
						<Text style={[styles.tableCell, styles.tableCellTime]}>
							{entry.endTime ? formatDateTime(entry.endTime) : ""}
						</Text>
					</>
				)}
				<Text style={[styles.tableCell, styles.tableCellTime]}>
					{formatDuration(duration)}
				</Text>
			</View>

			{entry.subEntries != null && (
				<View style={[styles.tableIndent, styles.tableRowWrapper]}>
					{entry.subEntries.map((entry, index) => (
						<TimesheetEntry
							entry={entry}
							key={index}
							currentTime={currentTime}
						/>
					))}
				</View>
			)}
		</Fragment>
	);
}

export default function TimesheetPdf({ data, title, currentTime }: Props) {
	const duration = getTotalDuration(data.entries, currentTime);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.heading}>
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.title}>Timesheet</Text>
				</View>

				<View style={styles.details}>
					<Text style={styles.detailsField}>
						<Text style={styles.detailsFieldName}>Date:</Text>
						{formatDate(currentTime)}
					</Text>

					<Text style={styles.detailsField}>
						<Text style={styles.detailsFieldName}>
							Total Duration:
						</Text>
						{formatDuration(duration)}
					</Text>
				</View>
				<View style={styles.tableContainer}>
					{/* Table Header */}
					<View
						style={[styles.tableRow, styles.tableRowHeader]}
						wrap={false}>
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
					{/* Table Data */}
					{data.entries.map((entry, index) => (
						<TimesheetEntry
							entry={entry}
							key={index}
							currentTime={currentTime}
						/>
					))}

					<View
						style={[styles.tableRow, styles.tableRowHeader]}
						wrap={false}>
						<Text style={[styles.tableCell, styles.tableCellBlock]}>
							Total
						</Text>

						<Text
							style={[styles.tableCell, styles.tableCellTime]}
						/>
						<Text
							style={[styles.tableCell, styles.tableCellTime]}
						/>

						<Text
							style={[
								styles.tableCell,
								styles.tableCellDuration,
							]}>
							{formatDuration(duration)}
						</Text>
					</View>
				</View>

				<Text style={styles.footNote} wrap={false}>
					Information present in this timesheet should be considered
					Commercial in Confidence.
				</Text>
			</Page>
		</Document>
	);
}

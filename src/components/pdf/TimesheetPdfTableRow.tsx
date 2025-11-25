import type { Moment } from "moment";
import React, { Fragment } from "react";
import { getEntryDuration } from "@/timekeep";
import { TimekeepSettings } from "@/settings";
import { TimeEntry } from "@/timekeep/schema";
import { View, Text } from "@react-pdf/renderer";
import { formatPdfRowDate, formatDurationLong } from "@/utils";

import { Styles } from "./styles";

type Props = {
	entry: TimeEntry;
	currentTime: Moment;
	settings: TimekeepSettings;
	styles: Styles;
};

export function TimesheetPdfTableRow({
	entry,
	currentTime,
	settings,
	styles,
}: Props) {
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
					styles={styles}
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

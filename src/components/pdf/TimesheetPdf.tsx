import React from "react";
import type { Moment } from "moment";
import { Timekeep } from "@/timekeep/schema";
import { getTotalDuration } from "@/timekeep";
import { TimekeepSettings } from "@/settings";
import { Page, View, Text, Document } from "@react-pdf/renderer";
import {
	formatPdfDate,
	formatDurationLong,
	formatDurationShort,
} from "@/utils";

import { createStyles } from "./styles";
import TimesheetPdfTable from "./TimesheetPdfTable";
import TimesheetPdfDetailField from "./TimesheetPdfDetailField";

type Props = {
	title: string;
	data: Timekeep;
	currentTime: Moment;
	footnote: string;
	settings: TimekeepSettings;
};

export default function TimesheetPdf({
	title,
	data,
	currentTime,
	footnote,
	settings,
}: Props) {
	// Get the total elapsed duration
	const duration = getTotalDuration(data.entries, currentTime);

	const currentDate = formatPdfDate(currentTime, settings);
	const totalDuration = formatDurationLong(duration);
	const totalDurationShort = formatDurationShort(duration);

	const styles = createStyles(settings.pdfFontFamily);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.heading}>
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.title}>Timesheet</Text>
				</View>

				<View style={styles.details}>
					<TimesheetPdfDetailField
						name="Date"
						value={currentDate}
						styles={styles}
					/>
					<TimesheetPdfDetailField
						name="Total Duration"
						value={totalDuration}
						styles={styles}
					/>
					<TimesheetPdfDetailField
						name="Total Duration (hours)"
						value={totalDurationShort}
						styles={styles}
					/>
				</View>

				<TimesheetPdfTable
					data={data}
					currentTime={currentTime}
					totalDuration={totalDuration}
					settings={settings}
					styles={styles}
				/>

				<Text style={styles.footNote} wrap={false}>
					{footnote}
				</Text>
			</Page>
		</Document>
	);
}

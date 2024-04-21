export const defaultSettings: TimekeepSettings = {
	pdfTitle: "Example Timesheet",
	pdfFootnote:
		"Information present in this timesheet should be considered Commercial in Confidence.",
	timestampFormat: "YY-MM-DD HH:mm:ss",
	editableTimestampFormat: "YYYY-MM-DD HH:mm:ss",
	csvTitle: true,
	csvDelimiter: ",",
	reverseSegmentOrder: false,
	timestampDurations: false,
	limitTableSize: true,
};

export interface TimekeepSettings {
	pdfTitle: string;
	pdfFootnote: string;
	timestampFormat: string;
	editableTimestampFormat: string;
	csvTitle: boolean;
	csvDelimiter: string;
	reverseSegmentOrder: boolean;
	timestampDurations: boolean;
	limitTableSize: boolean;
}

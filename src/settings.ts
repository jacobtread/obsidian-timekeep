export const defaultSettings: TimekeepSettings = {
	pdfTitle: "Example Timesheet",
	timestampFormat: "YY-MM-DD HH:mm:ss",
	editableTimestampFormat: "YYYY-MM-DD HH:mm:ss",
	csvTitle: true,
	csvDelimiter: ",",
	reverseSegmentOrder: false,
	timestampDurations: false,
};

export interface TimekeepSettings {
	pdfTitle: string;
	timestampFormat: string;
	editableTimestampFormat: string;
	csvTitle: boolean;
	csvDelimiter: string;
	reverseSegmentOrder: boolean;
	timestampDurations: boolean;
}

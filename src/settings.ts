export enum PdfExportBehavior {
	// Don't do anything after exporting
	NONE = "NONE",
	// Reveal the file using the system file explorer
	OPEN_PATH = "OPEN_PATH",
	// Open the exported PDF in the default app
	OPEN_FILE = "OPEN_FILE",
}

export interface TimekeepSettings {
	csvDelimiter: string;
	csvTitle: boolean;
	editableTimestampFormat: string;
	limitTableSize: boolean;
	pdfFootnote: string;
	pdfTitle: string;
	pdfExportBehavior: PdfExportBehavior;
	pdfDateFormat: string;
	pdfRowDateFormat: string;
	reverseSegmentOrder: boolean;
	timestampFormat: string;
	showDecimalHours: boolean;
}

export const defaultSettings: TimekeepSettings = {
	pdfTitle: "Example Timesheet",
	pdfFootnote:
		"Information present in this timesheet should be considered Commercial in Confidence.",
	pdfExportBehavior: PdfExportBehavior.OPEN_PATH,
	pdfDateFormat: "DD/MM/YYYY",
	pdfRowDateFormat: "DD/MM/YYYY HH:mm",
	timestampFormat: "YY-MM-DD HH:mm:ss",
	editableTimestampFormat: "YYYY-MM-DD HH:mm:ss",
	csvTitle: true,
	csvDelimiter: ",",
	reverseSegmentOrder: false,
	limitTableSize: true,
	showDecimalHours: true,
};

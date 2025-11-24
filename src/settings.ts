export enum PdfExportBehavior {
	// Don't do anything after exporting
	NONE = "NONE",
	// Reveal the file using the system file explorer
	OPEN_PATH = "OPEN_PATH",
	// Open the exported PDF in the default app
	OPEN_FILE = "OPEN_FILE",
}

export enum DurationFormat {
	// Format including all units (1h 30m 25s)
	LONG = "LONG",
	// Format just including hours (1.5h)
	SHORT = "SHORT",
	// Short format without units (1.5)
	DECIMAL = "DECIMAL",
}

export enum SortOrder {
	// Don't sort the the list, maintain insertion order
	INSERTION = "INSERTION",

	// Flip the insertion order
	REVERSE_INSERTION = "REVERSE_INSERTION",

	// Sort by the most recently started
	NEWEST_START = "NEWEST_START",

	// Sort by the oldest started entry
	OLDEST_START = "OLDEST_START",
}

export enum FontFamily {
	ROBOTO = "Roboto",
	RUBIK = "Rubik",
}

export enum UnstartedOrder {
	// Sort unstarted items to the start
	FIRST = "FIRST",
	// Sort unstarted items to the end
	LAST = "LAST",
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
	pdfFontFamily: FontFamily;
	reverseSegmentOrder?: boolean;
	timestampFormat: string;
	showDecimalHours: boolean;
	exportDurationFormat: DurationFormat;
	formatCopiedJSON: boolean;

	sortOrder: SortOrder;
	unstartedOrder: UnstartedOrder;
}

export const defaultSettings: TimekeepSettings = {
	pdfTitle: "Example Timesheet",
	pdfFootnote:
		"Information present in this timesheet should be considered Commercial in Confidence.",
	pdfExportBehavior: PdfExportBehavior.OPEN_PATH,
	pdfDateFormat: "DD/MM/YYYY",
	pdfRowDateFormat: "DD/MM/YYYY HH:mm",
	pdfFontFamily: FontFamily.ROBOTO,
	timestampFormat: "YY-MM-DD HH:mm:ss",
	editableTimestampFormat: "YYYY-MM-DD HH:mm:ss",
	csvTitle: true,
	csvDelimiter: ",",
	limitTableSize: true,
	showDecimalHours: true,
	exportDurationFormat: DurationFormat.SHORT,
	formatCopiedJSON: false,

	sortOrder: SortOrder.INSERTION,
	unstartedOrder: UnstartedOrder.LAST,
};

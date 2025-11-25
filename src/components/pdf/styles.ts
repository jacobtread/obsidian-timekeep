import { StyleSheet } from "@react-pdf/renderer";

export type Styles = ReturnType<typeof createStyles>;

export function createStyles(fontFamily = "Roboto") {
	return StyleSheet.create({
		// Styles for a page
		page: {
			fontFamily,
			padding: 15,
		},

		// Heading with the page title and timesheet title
		heading: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: 5,
		},

		// User specified title and "Timesheet"
		title: {
			fontFamily,
			fontWeight: 700,
			fontSize: 12,
			marginBottom: 5,
		},

		// Detail items at the top (Date, Total Duration, Short Duration)
		details: {
			gap: 4,
			marginBottom: 5,
		},

		// Footer note
		footNote: {
			marginTop: 10,
			fontSize: 6,
			fontFamily,
			fontWeight: 700,
		},

		// Name of a details field
		detailsFieldName: {
			fontFamily,
			fontWeight: 700,
			fontSize: 8,
			marginBottom: 5,
		},

		// Value of a details field
		detailsFieldValue: {
			fontSize: 8,
			marginBottom: 5,
		},

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
			fontFamily,
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
			fontFamily,
		},

		// Wrapper for nested rows
		tableRowWrapper: {
			borderColor: "#f9f9f9",
			borderWidth: 5,
		},

		// Table indentation container
		tableIndent: {
			borderLeftWidth: 5,
			borderLeftColor: "#999",
		},
	});
}

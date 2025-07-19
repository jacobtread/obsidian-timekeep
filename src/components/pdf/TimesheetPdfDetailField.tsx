import React from "react";
import { Text, StyleSheet } from "@react-pdf/renderer";

type Props = {
	name: string;
	value: string;
};

const styles = StyleSheet.create({
	// Name of a details field
	detailsFieldName: {
		fontFamily: "Roboto",
		fontWeight: 700,
		fontSize: 8,
		marginBottom: 5,
	},

	// Value of a details field
	detailsFieldValue: {
		fontSize: 8,
		marginBottom: 5,
	},
});

// Individual field within the details section
export default function TimesheetPdfDetailField({ name, value }: Props) {
	return (
		<Text style={styles.detailsFieldValue}>
			<Text style={styles.detailsFieldName}>{name}: </Text>
			{value}
		</Text>
	);
}

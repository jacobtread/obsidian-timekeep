import React from "react";
import { Text } from "@react-pdf/renderer";

import { Styles } from "./styles";

type Props = {
	name: string;
	value: string;
	styles: Styles;
};

// Individual field within the details section
export default function TimesheetPdfDetailField({
	name,
	value,
	styles,
}: Props) {
	return (
		<Text style={styles.detailsFieldValue}>
			<Text style={styles.detailsFieldName}>{name}: </Text>
			{value}
		</Text>
	);
}

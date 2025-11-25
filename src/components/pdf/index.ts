import React from "react";
import { Moment } from "moment";
import { Timekeep } from "@/timekeep/schema";
import { TimekeepSettings } from "@/settings";
import RubikBold from "@/fonts/Rubik-Bold.ttf";
import { pdf, Font } from "@react-pdf/renderer";
// Embedded fonts
import RobotoBold from "@/fonts/Roboto-Bold.ttf";
import RubikRegular from "@/fonts/Rubik-Regular.ttf";
import RobotoRegular from "@/fonts/Roboto-Regular.ttf";

import TimesheetPdf from "./TimesheetPdf";

// Register the embedded font (Roboto for a large range of supported languages/characters https://github.com/jacobtread/obsidian-timekeep/issues/1)
Font.register({
	family: "Roboto",
	fonts: [
		{
			src: RobotoRegular,
			fontWeight: 400,
		},
		{
			src: RobotoBold,
			fontWeight: 700,
		},
	],
});

// Register the Rubik font for Arabic character support (https://github.com/jacobtread/obsidian-timekeep/issues/61)
Font.register({
	family: "Rubik",
	fonts: [
		{
			src: RubikRegular,
			fontWeight: 400,
		},
		{
			src: RubikBold,
			fontWeight: 700,
		},
	],
});

/**
 * Generates a PDF for the provided timekeep
 *
 * @param timekeep The timekeep data to export
 * @param settings Current user settings for export settings
 * @param currentTime Current time to use for any unfinished entries
 * @returns The PDF buffer stream
 */
export async function createPdf(
	timekeep: Timekeep,
	settings: TimekeepSettings,
	currentTime: Moment
): Promise<NodeJS.ReadableStream> {
	const document = React.createElement(TimesheetPdf, {
		data: timekeep,
		title: settings.pdfTitle,
		footnote: settings.pdfFootnote,
		currentTime,
		settings,
	});

	// Create the PDF
	const createdPdf = pdf(document);

	// Create a blob from the PDF
	const buffer = await createdPdf.toBuffer();
	return buffer;
}

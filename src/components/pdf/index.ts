import { Moment } from "moment";
import { Timekeep } from "@/timekeep/schema";
import { TimekeepSettings } from "@/settings";
import { createPdfExport } from "@/components/pdf/renderer";

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
	return createPdfExport(timekeep, settings, currentTime);
}

import { Font } from "@/pdf";
// Embedded fonts
import RobotoBold from "@/fonts/Roboto-Bold.ttf";
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

export default TimesheetPdf;

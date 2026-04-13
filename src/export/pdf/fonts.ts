import type { TFontDictionary } from "pdfmake/interfaces";

import pdfMake from "pdfmake";

import RobotoBold from "@/fonts/Roboto-Bold.ttf";
import RobotoRegular from "@/fonts/Roboto-Regular.ttf";
import RubikBold from "@/fonts/Rubik-Bold.ttf";
import RubikRegular from "@/fonts/Rubik-Regular.ttf";

/**
 * Initialize the embedded fonts so that pdfmake can use them
 */
function initializeFonts() {
	const fonts: TFontDictionary = {
		Roboto: {
			normal: "Roboto-Regular.ttf",
			bold: "Roboto-Bold.ttf",
		},
		Rubik: {
			normal: "Rubik-Regular.ttf",
			bold: "Rubik-Bold.ttf",
		},
	};

	const stripDataUrlPrefix = (text: string): string =>
		text.substring("data:font/ttf;base64,".length);

	pdfMake.addVirtualFileSystem({
		"Roboto-Regular.ttf": stripDataUrlPrefix(RobotoRegular),
		"Roboto-Bold.ttf": stripDataUrlPrefix(RobotoBold),
		"Rubik-Regular.ttf": stripDataUrlPrefix(RubikRegular),
		"Rubik-Bold.ttf": stripDataUrlPrefix(RubikBold),
	});

	pdfMake.addFonts(fonts);
}

initializeFonts();

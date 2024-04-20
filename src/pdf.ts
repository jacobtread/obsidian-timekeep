/* 
    Re-exports from the browser version of react-pdf since it doesn't work 
    properly with the build system and decides to include the node version
*/

export {
	pdf,
	Page,
	Text,
	View,
	Document,
	StyleSheet,
	Font,
} from "../node_modules/@react-pdf/renderer/lib/react-pdf.browser.cjs";

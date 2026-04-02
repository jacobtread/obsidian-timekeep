import { Command } from "obsidian";

import { createCodeBlock } from "@/utils/codeblock";

export default function (): Command {
	return {
		id: `insert`,
		name: `Insert Tracker`,
		editorCallback: (editor) => {
			const codeblock = createCodeBlock(`{"entries":[]}`, 1, 1);
			editor.replaceSelection(codeblock);
		},
	};
}

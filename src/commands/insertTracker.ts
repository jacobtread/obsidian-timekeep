import { Command } from "obsidian";

export default function (): Command {
	return {
		id: `insert`,
		name: `Insert Tracker`,
		editorCallback: (e) => {
			e.replaceSelection('\n```timekeep\n{"entries": []}\n```\n');
		},
	};
}

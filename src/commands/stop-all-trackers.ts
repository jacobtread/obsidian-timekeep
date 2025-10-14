import { App, Notice, moment } from "obsidian";
import { isKeepRunning } from "@/timekeep";
import { stopRunningEntries } from "@/timekeep/update";

export async function stopAllTrackers(app: App) {
	const now = moment();
	const files = app.vault.getMarkdownFiles();
	let changedFiles = 0;

	for (const file of files) {
		const content = await app.vault.read(file);
		const originalContent = content;

		const codeblockRegex = /```timekeep\n([\s\S]*?)\n```/g;
		let match;
		let newContent = content;

		while ((match = codeblockRegex.exec(originalContent)) !== null) {
			const codeblockContent = match[1];
			try {
				const timekeep = JSON.parse(codeblockContent);
				if (isKeepRunning(timekeep)) {
					const stoppedEntries = stopRunningEntries(timekeep.entries, now);
					const newTimekeep = {
						...timekeep,
						entries: stoppedEntries,
					};
					const newTimekeepString = JSON.stringify(newTimekeep, null, '  ');
					const newCodeblock = '```timekeep\n' + newTimekeepString + '\n```';
					newContent = newContent.replace(match[0], newCodeblock);
				}
			} catch (e) {
				console.error("Timekeep: Failed to parse timekeep JSON", e);
			}
		}

		if (originalContent !== newContent) {
			await app.vault.modify(file, newContent);
			changedFiles++;
		}
	}
	new Notice(`Stopped trackers in ${changedFiles} files.`);
}
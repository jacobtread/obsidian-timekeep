import {
	TFile,
	Vault,
	type EventRef,
	type MarkdownPostProcessorContext,
	type TAbstractFile,
} from "obsidian";

import type { TimesheetSaveAdapter } from "./TimesheetSaveAdapter";

import { replaceTimekeepCodeblock } from "@/timekeep/parser";
import type { Timekeep } from "@/timekeep/schema";

export class TimesheetMarkdownSaveAdapter implements TimesheetSaveAdapter {
	/** Access to the vault */
	vault: Vault;

	/** Context from the markdown */
	context: MarkdownPostProcessorContext;
	/** HTML container element */
	containerEl: HTMLElement;
	/** Path to the file the timekeep is within */
	fileSourcePath: string;

	/** Event ref for the registered rename event */
	renameEventRef: EventRef | undefined;

	constructor(vault: Vault, containerEl: HTMLElement, context: MarkdownPostProcessorContext) {
		this.vault = vault;
		this.containerEl = containerEl;
		this.context = context;
		this.fileSourcePath = context.sourcePath;
	}

	onLoad(): void {
		this.renameEventRef = this.vault.on("rename", this.onVaultRename.bind(this));
	}

	onUnload(): void {
		if (this.renameEventRef) {
			this.vault.offref(this.renameEventRef);
		}
	}

	onVaultRename(file: TAbstractFile, oldName: string) {
		if (file instanceof TFile && oldName == this.fileSourcePath) {
			this.fileSourcePath = file.path;
		}
	}

	async onSave(timekeep: Timekeep): Promise<void> {
		const sectionInfo = this.context.getSectionInfo(this.containerEl);

		// Ensure we actually have a section to write to
		if (sectionInfo === null) throw new Error("Section to write did not exist");

		const file = this.vault.getFileByPath(this.fileSourcePath);

		// Ensure the file still exists
		if (file === null) throw new Error("File no longer exists");

		// Replace the stored timekeep block with the new one
		await this.vault.process(file, (data) => {
			return replaceTimekeepCodeblock(
				timekeep,
				data,
				sectionInfo.lineStart,
				sectionInfo.lineEnd
			);
		});
	}
}

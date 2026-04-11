import type { TFile, Vault } from "obsidian";

import type { TimesheetSaveAdapter } from "./TimesheetSaveAdapter";

import { stripTimekeepRuntimeData, type Timekeep } from "@/timekeep/schema";

export class TimesheetFileSaveAdapter implements TimesheetSaveAdapter {
	/** Access to the vault */
	vault: Vault;

	/** File that should be saved to */
	file: TFile | null;

	constructor(vault: Vault, file: TFile | null) {
		this.vault = vault;
		this.file = file;
	}

	onLoad(): void {}
	onUnload(): void {}

	async onSave(timekeep: Timekeep): Promise<void> {
		if (this.file === null) {
			return;
		}

		try {
			const stripped = stripTimekeepRuntimeData(timekeep);
			const serialized = JSON.stringify(stripped);

			await this.vault.modify(this.file, serialized);
		} catch (error) {
			console.error("failed to save file", error);
		}
	}
}

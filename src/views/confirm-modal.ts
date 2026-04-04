import type { App } from "obsidian";

import { Modal, Setting } from "obsidian";

export class ConfirmModal extends Modal {
	// Message to show in the modal
	message: string;

	// The choice that the user made
	value: boolean | null;

	constructor(app: App, message: string, callback: (choice: boolean) => void) {
		super(app);
		this.message = message;
		this.value = null;

		// Set the close callback to invoke with the users selection if they made one
		this.setCloseCallback(() => {
			if (this.value !== null) {
				callback(this.value);
			}
		});
	}

	onOpen(): void {
		this.contentEl.createEl("p", { text: this.message });

		new Setting(this.contentEl)
			.addButton((btn) => btn.setButtonText("Ok").setCta().onClick(this.onOk.bind(this)))
			.addButton((btn) => btn.setButtonText("Cancel").onClick(this.onCancel.bind(this)));
	}

	onOk() {
		this.value = true;
		this.close();
	}

	onCancel() {
		this.value = false;
		this.close();
	}
}

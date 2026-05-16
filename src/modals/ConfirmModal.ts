import type { App } from "obsidian";

import { Modal, Setting } from "obsidian";

export class ConfirmModal extends Modal {
	// Message to show in the modal
	message: string;

	// The choice that the user made
	value: boolean | null;

	// Callback for the result
	callback: (choice: boolean) => void;

	constructor(app: App, message: string, callback: (choice: boolean) => void) {
		super(app);
		this.message = message;
		this.value = null;
		this.callback = callback;
	}

	onOpen(): void {
		this.contentEl.createEl("p", { text: this.message });

		new Setting(this.contentEl)
			.addButton((btn) => {
				btn.buttonEl.setAttribute("data-action", "ok");
				btn.setClass("timekeep-confirm-modal-button")
					.setButtonText("Ok")
					.setCta()
					.onClick(this.onOk.bind(this));
			})
			.addButton((btn) => {
				btn.buttonEl.setAttribute("data-action", "cancel");
				btn.setClass("timekeep-confirm-modal-button")
					.setButtonText("Cancel")
					.onClick(this.onCancel.bind(this));
			});
	}

	onOk() {
		this.value = true;
		this.close();
		this.callback(this.value);
	}

	onCancel() {
		this.value = false;
		this.close();
		this.callback(this.value);
	}
}

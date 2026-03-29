import { type App, Modal, Setting } from "obsidian";

export class FileNamePromptModal extends Modal {
	// Callback to run on submission
	callback: (name: string | null) => void;

	// Whether the user picked a option
	picked: boolean;

	constructor(app: App, callback: (name: string | null) => void) {
		super(app);
		this.callback = callback;
	}

	static pick(app: App): Promise<string | null> {
		return new Promise((resolve) => {
			new FileNamePromptModal(app, resolve).open();
		});
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.createEl("p", { text: "Enter name to save the exported PDF file as:" });

		const nameInputEl = contentEl.createEl("input", {
			cls: "timekeep-pick-file-name-input",
			placeholder: "Timesheet.pdf",
			value: "Timesheet.pdf",
		});

		new Setting(contentEl)

			.addButton((btn) =>
				btn
					.setButtonText("Ok")
					.setCta()
					.onClick(() => {
						const name = nameInputEl.value;
						this.picked = true;
						this.close();
						this.callback(name);
					})
			)
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => {
					this.picked = true;
					this.close();
					this.callback(null);
				})
			);
	}

	onClose(): void {
		if (!this.picked) {
			this.callback(null);
		}
	}
}

import { type App, Modal, Setting } from "obsidian";

export class FileNamePromptModal extends Modal {
	// Callback to run on submission
	callback: (name: string | null) => void;

	// Whether the user picked a option
	picked: boolean = false;

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
						this.callback(name);
						this.close();
					})
			)
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => {
					this.picked = true;
					this.callback(null);
					this.close();
				})
			);
	}

	onClose(): void {
		if (!this.picked) {
			this.callback(null);
		}
	}
}

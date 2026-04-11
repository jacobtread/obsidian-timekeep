import type { Store } from "@/store";

import { ReplaceableComponent } from "../ReplaceableComponent";

import { stripTimekeepRuntimeData, type Timekeep } from "@/timekeep/schema";

/**
 * Component for showing the "Failed to save current timekeep" error
 */
export class TimesheetSaveError extends ReplaceableComponent {
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;

	constructor(containerEl: HTMLElement, timekeep: Store<Timekeep>) {
		super(containerEl);
		this.timekeep = timekeep;
	}

	createContainer(): HTMLElement {
		return createDiv({
			cls: "timekeep-container",
		});
	}

	render(wrapperEl: HTMLElement): void {
		const errorEl = wrapperEl.createDiv({ cls: "timekeep-error" });
		errorEl.createEl("h1", { text: "Warning" });
		errorEl.createEl("p", { text: "Failed to save current timekeep" });
		errorEl.createEl("p", {
			text:
				`Press "Retry" to try again or "Copy Timekeep" to copy a\n ` +
				`backup to clipboard, an automated backup JSON file will be\n ` +
				`generated in the root of this vault`,
		});

		const actions = wrapperEl.createDiv({ cls: "timekeep-actions" });

		const retryButton = actions.createEl("button", { text: "Retry" });
		const copyButton = actions.createEl("button", {
			text: "Copy Timekeep",
		});

		this.registerDomEvent(retryButton, "click", this.onRetrySave.bind(this));

		this.registerDomEvent(copyButton, "click", this.onCopy.bind(this));
	}

	onRetrySave() {
		// Set the state to itself to trigger another save attempt
		this.timekeep.setState(this.timekeep.getState());
	}

	async onCopy() {
		await navigator.clipboard.writeText(
			JSON.stringify(stripTimekeepRuntimeData(this.timekeep.getState()))
		);
	}
}

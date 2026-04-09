import type { Store } from "@/store";

import { DomComponent } from "@/components/DomComponent";

import { stripTimekeepRuntimeData, type Timekeep } from "@/timekeep/schema";

type HandleSaveTimekeep = (value: Timekeep) => Promise<void>;

/**
 * Component for showing the "Failed to save current timekeep" error
 */
export class TimesheetSaveError extends DomComponent {
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Callback to save the timekeep */
	handleSaveTimekeep: HandleSaveTimekeep;

	constructor(
		containerEl: HTMLElement,
		timekeep: Store<Timekeep>,
		handleSaveTimekeep: HandleSaveTimekeep
	) {
		super(containerEl);

		this.timekeep = timekeep;
		this.handleSaveTimekeep = handleSaveTimekeep;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.containerEl.createDiv({
			cls: "timekeep-container",
		});
		this.wrapperEl = wrapperEl;

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
		// Attempt to save the current timekeep
		void this.handleSaveTimekeep(this.timekeep.getState());
	}

	async onCopy() {
		await navigator.clipboard.writeText(
			JSON.stringify(stripTimekeepRuntimeData(this.timekeep.getState()))
		);
	}
}

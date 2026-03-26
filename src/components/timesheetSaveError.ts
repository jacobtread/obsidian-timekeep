import type { Store } from "@/store";
import { stripTimekeepRuntimeData, type Timekeep } from "@/timekeep/schema";
import { Component } from "obsidian";

type HandleSaveTimekeep = (value: Timekeep) => Promise<void>;

/**
 * Component for showing the "Failed to save current timekeep" error
 */
export class TimesheetSaveError extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Callback to save the timekeep */
	handleSaveTimekeep: HandleSaveTimekeep;

	/** Container created by this component */
	#wrapperEl: HTMLElement | undefined;

	constructor(
		containerEl: HTMLElement,
		timekeep: Store<Timekeep>,
		handleSaveTimekeep: HandleSaveTimekeep
	) {
		super();

		this.#containerEl = containerEl;
		this.timekeep = timekeep;
		this.handleSaveTimekeep = handleSaveTimekeep;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.#containerEl.createDiv({
			cls: "timekeep-container",
		});

		this.#wrapperEl = wrapperEl;

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

	onunload(): void {
		super.onunload();
		this.#wrapperEl?.remove();
	}

	onRetrySave() {
		// Attempt to save the current timekeep
		void this.handleSaveTimekeep(this.timekeep.getState());
	}

	onCopy() {
		void navigator.clipboard.writeText(
			JSON.stringify(stripTimekeepRuntimeData(this.timekeep.getState()))
		);
	}
}

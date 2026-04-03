import { Component } from "obsidian";

/**
 * Component for rendering a load error for a timesheet
 */
export class TimesheetLoadError extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** Wrapper container element */
	#wrapperEl: HTMLElement | undefined;

	/** The load error message */
	error: string;

	constructor(containerEl: HTMLElement, error: string) {
		super();

		this.#containerEl = containerEl;

		this.error = error;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.#containerEl.createDiv({
			cls: "timekeep-container",
		});
		this.#wrapperEl = wrapperEl;
		wrapperEl.createEl("p", {
			text: `Failed to load timekeep: ${this.error}`,
		});
	}

	onunload(): void {
		super.onunload();
		this.#wrapperEl?.remove();
	}
}

import { DomComponent } from "./domComponent";

/**
 * Component for rendering a load error for a timesheet
 */
export class TimesheetLoadError extends DomComponent {
	/** The load error message */
	error: string;

	constructor(containerEl: HTMLElement, error: string) {
		super(containerEl);

		this.error = error;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.containerEl.createDiv({
			cls: "timekeep-container",
		});
		this.wrapperEl = wrapperEl;
		wrapperEl.createEl("p", {
			text: `Failed to load timekeep: ${this.error}`,
		});
	}
}

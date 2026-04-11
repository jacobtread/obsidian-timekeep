import { ReplaceableComponent } from "../ReplaceableComponent";

/**
 * Component for rendering a load error for a timesheet
 */
export class TimesheetLoadError extends ReplaceableComponent {
	/** The load error message */
	error: string;

	constructor(containerEl: HTMLElement, error: string) {
		super(containerEl);

		this.error = error;
	}

	createContainer(): HTMLElement {
		return createDiv({
			cls: "timekeep-container",
		});
	}

	render(wrapperEl: HTMLElement): void {
		wrapperEl.createEl("p", {
			text: `Failed to load timekeep: ${this.error}`,
		});
	}
}

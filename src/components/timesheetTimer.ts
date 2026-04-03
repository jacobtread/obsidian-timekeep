import { DomComponent } from "./domComponent";

/**
 * Timer component for the split side by side timers at the top
 * of the timekeep display
 */
export class TimesheetTimer extends DomComponent {
	/** Label to display on the timer  */
	#label: string;

	/** Primary value display element */
	#primaryValueEl: HTMLSpanElement | undefined;
	/** Secondary value display element */
	#secondaryValueEl: HTMLSpanElement | undefined;

	constructor(containerEl: HTMLElement, label: string) {
		super(containerEl);
		this.#label = label;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.containerEl.createDiv({ cls: "timekeep-timer" });
		this.wrapperEl = wrapperEl;

		const primaryValueEl = wrapperEl.createDiv({ cls: "timekeep-timer-value" });
		const secondaryValueEl = wrapperEl.createDiv({ cls: "timekeep-timer-value-small" });
		wrapperEl.createSpan({ text: this.#label });

		this.#primaryValueEl = primaryValueEl;
		this.#secondaryValueEl = secondaryValueEl;

		this.setValues("", " ");
	}

	/**
	 * Set the hidden state of the timer
	 *
	 * @param hidden Whether the timer is hidden
	 */
	setHidden(hidden: boolean) {
		if (!this.wrapperEl) return;
		this.wrapperEl.hidden = hidden;
	}

	/**
	 * Set the primary and secondary values, updates
	 * the visual elements
	 *
	 * @param primary The primary value
	 * @param secondary The secondary value
	 */
	setValues(primary: string, secondary: string) {
		if (!this.#primaryValueEl || !this.#secondaryValueEl) return;

		this.#primaryValueEl.textContent = primary;

		this.#secondaryValueEl.textContent = secondary;
		this.#secondaryValueEl.hidden = secondary.length < 1;
	}
}

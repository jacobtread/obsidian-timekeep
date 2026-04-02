import { Component } from "obsidian";

/**
 * Timer component for the split side by side timers at the top
 * of the timekeep display
 */
export class TimesheetTimer extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** Label to display on the timer  */
	#label: string;

	/** Timer container element */
	#timerEl: HTMLDivElement | undefined;
	/** Primary value display element */
	#primaryValueEl: HTMLSpanElement | undefined;
	/** Secondary value display element */
	#secondaryValueEl: HTMLSpanElement | undefined;

	constructor(containerEl: HTMLElement, label: string) {
		super();

		this.#containerEl = containerEl;
		this.#label = label;
	}

	onload(): void {
		super.onload();

		const timerEl = this.#containerEl.createDiv({ cls: "timekeep-timer" });
		this.#timerEl = timerEl;

		const primaryValueEl = timerEl.createDiv({ cls: "timekeep-timer-value" });
		const secondaryValueEl = timerEl.createDiv({ cls: "timekeep-timer-value-small" });
		timerEl.createSpan({ text: this.#label });

		this.#primaryValueEl = primaryValueEl;
		this.#secondaryValueEl = secondaryValueEl;

		this.setValues("", " ");
	}

	onunload(): void {
		super.onunload();
		this.#timerEl?.remove();
	}

	/**
	 * Set the hidden state of the timer
	 *
	 * @param hidden Whether the timer is hidden
	 */
	setHidden(hidden: boolean) {
		if (!this.#timerEl) return;
		this.#timerEl.hidden = hidden;
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

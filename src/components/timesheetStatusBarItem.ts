import { Component } from "obsidian";

import { TimeEntry } from "@/timekeep/schema";

import { TimesheetRowDurationComponent } from "./timesheetRowDuration";

export class TimesheetStatusBarItem extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** The entry this duration belongs to */
	entry: TimeEntry;

	/** The time span element */
	#wrapperEl: HTMLSpanElement | undefined;

	/** Currently tracked background interval for content */
	currentContentInterval: number | undefined;

	/** Component for rendering the real time updating duration */
	duration: TimesheetRowDurationComponent;

	/** Callback to open the file when the content is clicked */
	onOpen: VoidFunction;
	/** Callback to stop the timekeep item */
	onStop: VoidFunction;

	constructor(
		containerEl: HTMLElement,
		entry: TimeEntry,
		onOpen: VoidFunction,
		onStop: VoidFunction
	) {
		super();

		this.#containerEl = containerEl;
		this.entry = entry;

		this.onOpen = onOpen;
		this.onStop = onStop;
	}

	onload(): void {
		super.onload();

		const entry = this.entry;
		const wrapperEl = this.#containerEl.createDiv({ cls: "timekeep-status-item" });
		this.#wrapperEl = wrapperEl;

		// const stopButton = wrapperEl.createEl("button", {
		// 	cls: "timekeep-status-item__button",
		// });
		// this.registerDomEvent(stopButton, "click", this.onStop);

		const contentEl = wrapperEl.createDiv({
			cls: "timekeep-status-item__content",
			title: "Open File",
		});

		contentEl.createSpan({
			cls: "timekeep-status-item__name",
			text: entry.name + ":",
		});

		this.addChild(new TimesheetRowDurationComponent(contentEl, entry));

		this.registerDomEvent(contentEl, "click", this.onOpen);
	}

	onunload(): void {
		super.onunload();
		this.#wrapperEl?.remove();
	}
}

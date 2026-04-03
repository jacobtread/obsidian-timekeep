import { TimeEntry } from "@/timekeep/schema";

import { DomComponent } from "./domComponent";
import { createObsidianIcon } from "./obsidianIcon";
import { TimesheetRowDurationComponent } from "./timesheetRowDuration";

export class TimesheetStatusBarItem extends DomComponent {
	/** The entry this duration belongs to */
	entry: TimeEntry;

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
		super(containerEl);

		this.entry = entry;

		this.onOpen = onOpen;
		this.onStop = onStop;
	}

	onload(): void {
		super.onload();

		const entry = this.entry;
		const wrapperEl = this.containerEl.createDiv({ cls: "timekeep-status-item" });
		this.wrapperEl = wrapperEl;

		const stopIcon = createObsidianIcon(wrapperEl, "stop-circle", [
			"timekeep-status-item__button",
			"button-icon",
		]);
		this.registerDomEvent(stopIcon, "click", this.onStop);
		stopIcon.title = "Stop Entry";

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
}

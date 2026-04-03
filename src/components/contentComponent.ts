import { Component } from "obsidian";

import { DomComponent } from "./domComponent";

export class ContentComponent<C extends Component> extends DomComponent {
	#content: C | undefined = undefined;

	constructor(containerEl: HTMLElement) {
		super(containerEl);
	}

	getContent(): C | undefined {
		return this.#content;
	}

	/**
	 * Swaps the active content view with the provided content
	 *
	 * @param content The new content to show
	 */
	setContent(content: C | undefined) {
		if (this.#content) {
			this.removeChild(this.#content);
		}

		this.#content = content;

		if (this.#content !== undefined) {
			this.addChild(this.#content);
		}
	}
}

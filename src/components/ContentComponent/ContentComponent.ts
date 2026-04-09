import type { Component } from "obsidian";

import { DomComponent } from "@/components/DomComponent";
import { ReplaceableComponent } from "@/components/ReplaceableComponent";

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
		let previousContent: C | undefined = this.#content;
		let previousElement: HTMLElement | undefined;

		if (previousContent) {
			// Mark for replacement if both are replaceable components
			if (
				content instanceof ReplaceableComponent &&
				previousContent instanceof ReplaceableComponent
			) {
				previousElement = previousContent.wrapperEl;
				previousContent.skipUnloadReplace = true;
			}

			this.removeChild(previousContent);
		}

		this.#content = content;

		// Set the previous element to be replaced by the new content
		if (content instanceof ReplaceableComponent && previousElement) {
			content.previousElement = previousElement;
		}

		if (content !== undefined) {
			this.addChild(content);
		}
	}
}

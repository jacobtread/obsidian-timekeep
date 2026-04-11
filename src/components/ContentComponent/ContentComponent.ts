import { DomComponent } from "@/components/DomComponent";
import { ReplaceableComponent } from "@/components/ReplaceableComponent";

export class ContentComponent<C extends ReplaceableComponent> extends DomComponent {
	content: C | undefined = undefined;

	constructor(containerEl: HTMLElement) {
		super(containerEl);
	}

	getContent(): C | undefined {
		return this.content;
	}

	/**
	 * Swaps the active content view with the provided content
	 *
	 * @param content The new content to show
	 */
	setContent(content: C) {
		let previousContent: C | undefined = this.content;
		let previousElement: HTMLElement | undefined;

		if (previousContent) {
			previousElement = previousContent.wrapperEl;
			previousContent.skipUnloadReplace = true;

			this.removeChild(previousContent);
		}

		this.content = content;

		// Set the previous element to be replaced by the new content
		if (previousElement !== undefined) {
			content.previousElement = previousElement;
		}

		this.addChild(content);
	}

	isForcedUnload(): boolean {
		return true;
	}
}

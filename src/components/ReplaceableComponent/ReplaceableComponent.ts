import { DomComponent } from "@/components/DomComponent";

export abstract class ReplaceableComponent extends DomComponent {
	/** Previous element that should be replaced when rendering */
	previousElement: HTMLElement | undefined;

	/**
	 * Whether to skip removing ourselves because another component
	 * has indicated that it will replace us
	 */
	skipUnloadReplace: boolean = false;

	constructor(containerEl: HTMLElement) {
		super(containerEl);
	}

	onload(): void {
		const wrapperEl = this.createContainer();
		if (this.previousElement) {
			this.containerEl.replaceChild(wrapperEl, this.previousElement);
			this.previousElement = undefined;
		} else {
			this.containerEl.appendChild(wrapperEl);
		}

		this.wrapperEl = wrapperEl;
		super.onload();

		this.render(wrapperEl);
	}

	isUnloadSkipped(): boolean {
		return super.isUnloadSkipped() || this.skipUnloadReplace;
	}

	/**
	 * Render the component content within the wrapper element created
	 * through {@link createContainer}
	 *
	 * @param wrapperEl
	 */
	abstract render(wrapperEl: HTMLElement): void;

	/**
	 * User defined function for creating the container that is
	 * the replaceable element
	 */
	abstract createContainer(): HTMLElement;
}

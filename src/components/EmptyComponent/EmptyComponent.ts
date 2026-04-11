import { ReplaceableComponent } from "../ReplaceableComponent";

export class EmptyComponent extends ReplaceableComponent {
	constructor(containerEl: HTMLElement) {
		super(containerEl);
	}

	createContainer(): HTMLElement {
		return createDiv();
	}

	render(_wrapperEl: HTMLElement): void {}
}

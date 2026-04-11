import { Component } from "obsidian";

/**
 * Component with an attached DOM element that can be unloaded with or
 * without detaching the DOM element.
 *
 * This allows for fast detaching when a full DOM tree is being removed
 * (i.e a re-render of a large section that requires removing hundreds of elements)
 * this can skip that work by only having the parent remove itself and
 * skipping detaching the children
 */
export class DomComponent extends Component {
	/** Parent DOM component to check */
	parent: DomComponent | null = null;
	/** Parent container element */
	containerEl: HTMLElement;
	/** Wrapper element that is mounted to the DOM */
	wrapperEl: HTMLElement | undefined = undefined;
	/** Whether the DOM element was unmounted */
	unmounted: boolean = false;

	constructor(containerEl: HTMLElement) {
		super();
		this.containerEl = containerEl;
	}

	addChild<T extends Component>(component: T): T {
		if (component instanceof DomComponent) {
			component.parent = this;
		}

		super.addChild(component);
		return component;
	}

	removeChild<T extends Component>(component: T): T {
		if (component instanceof DomComponent && component.parent == this) {
			component.parent = null;
		}

		super.removeChild(component);
		return component;
	}

	isUnloadSkipped() {
		if (this.parent === null) return false;
		if (this.parent.isForcedUnload()) return false;

		return this.parent.unmounted;
	}

	unload(): void {
		// Mark ourselves as unmounted before unloading children
		this.unmounted = true;
		super.unload();
	}

	onunload(): void {
		super.onunload();

		// Skip unmounting from the DOM if the parent is already unmounted
		if (this.isUnloadSkipped()) {
			return;
		}

		// Remove our wrapper if the parent is not unmounted already
		this.wrapperEl?.remove();
	}

	/**
	 * Whether to force the unloading of children, used by ContentComponent
	 * which itself does not detach anything from the DOM instead relying
	 * on the underlying ReplaceableComponent for DOM content
	 *
	 * @returns Whether the unload of children should be forced
	 */
	isForcedUnload() {
		return false;
	}
}

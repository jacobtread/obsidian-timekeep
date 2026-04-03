import { setIcon } from "obsidian";

/**
 * Utility function fro creating Obsidian icon elements
 *
 * @param containerEl The container to create the icon within
 * @param icon The icon name
 * @param className Optional class name to assign the icon svg element
 * @returns The wrapper <div/> containing the icon svg
 */
export function createObsidianIcon(
	containerEl: HTMLElement,
	icon: string,
	className?: string | string[]
): HTMLDivElement {
	const wrapperEl = containerEl.createDiv({ cls: "timekeep-icon-wrapper" });
	setIcon(wrapperEl, icon);

	// Get the created icon child element
	const firstChild = wrapperEl.firstElementChild;

	// Assign the custom class if available
	if (firstChild && className) {
		if (Array.isArray(className)) {
			firstChild.classList.add(...className);
		} else {
			firstChild.classList.add(className);
		}
	}

	return wrapperEl;
}

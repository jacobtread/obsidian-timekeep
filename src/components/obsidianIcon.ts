import { setIcon } from "obsidian";

export function createObsidianIcon(
    containerEl: HTMLElement,
    icon: string,
    className?: string
): HTMLDivElement {
    const wrapperEl = containerEl.createDiv();
    wrapperEl.setCssStyles({
        display: "inline-block",
        lineHeight: "1",
        padding: "0",
        margin: "0",
    });

    setIcon(wrapperEl, icon);

    // Get the created icon child element
    const firstChild = wrapperEl.firstElementChild;

    // Assign the custom class if available
    if (firstChild && className) firstChild.addClass(className);

    return wrapperEl;
}

import { setIcon } from "obsidian";
import React, { useRef, useEffect, DOMAttributes } from "react";

type Props = {
	// Obsidian icon
	icon: string;
	// Class name to apply to the icon
	className?: string;
} & DOMAttributes<HTMLDivElement>;

/**
 * Wrapper around the Obsidian setIcon function to use
 * built-in lucide icons from Obsidian
 */
export default function ObsidianIcon({ icon, className, ...props }: Props) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const wrapper = wrapperRef.current;

		if (wrapper === null) return;

		setIcon(wrapper, icon);

		// Get the created icon child element
		const firstChild = wrapper.firstElementChild;

		// Assign the custom class if available
		if (firstChild && className) firstChild.addClass(className);

		return () => {
			// Clear the icon element
			wrapper.innerHTML = "";
		};
	}, [icon, className, wrapperRef.current]);

	return (
		<div
			{...props}
			style={{
				display: "inline-block",
				lineHeight: 1,
				padding: 0,
				margin: 0,
			}}
			ref={wrapperRef}
		/>
	);
}

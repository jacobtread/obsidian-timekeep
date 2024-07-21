import React from "react";
import { useTimekeepStore } from "@/store/timekeep-store";

export default function TimesheetSaveError() {
	const store = useTimekeepStore();

	// Attempts to re-save the current timekeep
	const onRetrySave = () => {
		// Attempt to save the current timekeep
		store.saveTimekeep(store.getTimekeep());
	};

	// Copies the current timekeep state as JSON to clipboard
	const onClickCopy = () => {
		navigator.clipboard.writeText(JSON.stringify(store.getTimekeep()));
	};

	return (
		<div className="timekeep-container">
			<div className="timekeep-error">
				<h1>Warning</h1>
				<p>Failed to save current timekeep</p>
				<p>
					Press "Retry" to try again or "Copy Timekeep" to copy a
					backup to clipboard, an automated backup JSON file will be
					generated in the root of this vault
				</p>
			</div>

			<div className="timekeep-actions">
				<button onClick={onRetrySave}>Retry</button>
				<button onClick={onClickCopy}>Copy Timekeep</button>
			</div>
		</div>
	);
}

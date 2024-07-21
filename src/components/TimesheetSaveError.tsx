import React from "react";
import { Timekeep } from "@/schema";
import { useTimekeepStore } from "@/contexts/use-timekeep-store";

type Props = {
	// Callback to save the timekeep
	handleSaveTimekeep: (value: Timekeep) => Promise<void>;
};

export default function TimesheetSaveError({ handleSaveTimekeep }: Props) {
	const timekeepStore = useTimekeepStore();

	// Attempts to re-save the current timekeep
	const onRetrySave = () => {
		// Attempt to save the current timekeep
		handleSaveTimekeep(timekeepStore.getState());
	};

	// Copies the current timekeep state as JSON to clipboard
	const onClickCopy = () => {
		navigator.clipboard.writeText(JSON.stringify(timekeepStore.getState()));
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

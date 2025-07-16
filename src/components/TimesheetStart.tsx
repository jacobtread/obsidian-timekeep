import moment from "moment";
import { useStore } from "@/store";
import { formatTimestamp } from "@/utils";
import React, { useMemo, useState, FormEvent } from "react";
import { useSettings } from "@/contexts/use-settings-context";
import { useTimekeepStore } from "@/contexts/use-timekeep-store";
import {
	updateEntry,
	startNewEntry,
	getPathToEntry,
	getRunningEntry,
	stopRunningEntries,
} from "@/timekeep";

import ObsidianIcon from "./ObsidianIcon";

/**
 * Component for the timekeep start button and "name" field isolating
 * them to prevent needing to re-render the table when typing out the
 * name field
 */
export default function TimekeepStart() {
	const store = useTimekeepStore();
	const timekeep = useStore(store);
	const settings = useSettings();

	const [name, setName] = useState("");

	const [editing, setEditing] = useState(false);
	const [editingName, setEditingName] = useState("");

	const { currentEntry, pathToEntry } = useMemo(() => {
		const currentEntry = getRunningEntry(timekeep.entries);
		const pathToEntry = currentEntry
			? getPathToEntry(timekeep.entries, currentEntry)
			: null;
		return { currentEntry, pathToEntry };
	}, [timekeep]);

	const isTimekeepRunning = currentEntry !== null;

	const onStart = (event: FormEvent) => {
		// Prevent form submission from reloading Obsidian
		event.preventDefault();
		event.stopPropagation();

		store.setState((timekeep) => {
			const currentTime = moment();
			const entries = startNewEntry(name, currentTime, timekeep.entries);

			// Reset name input
			setName("");

			return {
				...timekeep,
				entries,
			};
		});
	};

	const onSave = (event: FormEvent) => {
		// Prevent form submission from reloading Obsidian
		event.preventDefault();
		event.stopPropagation();

		const entry = currentEntry;
		if (!entry) return;

		store.setState((timekeep) => {
			const entries = updateEntry(timekeep.entries, entry.id, {
				...entry,
				name: editingName,
			});

			return {
				...timekeep,
				entries,
			};
		});
	};

	const onStop = (event: FormEvent) => {
		// Prevent form submission from reloading Obsidian
		event.preventDefault();
		event.stopPropagation();

		store.setState((timekeep) => {
			const currentTime = moment();

			return {
				...timekeep,
				entries: stopRunningEntries(timekeep.entries, currentTime),
			};
		});
	};

	return (
		<div>
			{editing ? (
				/* Edit the name of the current entry */
				<form
					className="timekeep-start-area"
					data-area="start"
					onSubmitCapture={onSave}>
					<div className="timekeep-name-wrapper">
						<label htmlFor="timekeepBlockName">Edit Name:</label>

						<input
							id="timekeepBlockName"
							className="timekeep-name"
							placeholder="Example Block"
							type="text"
							value={editingName}
							onChange={(event) =>
								setEditingName(event.target.value)
							}
						/>
					</div>

					<button
						type="submit"
						title="Save"
						className="timekeep-start timekeep-start--save">
						<ObsidianIcon icon="save" className="button-icon" />
					</button>

					<button
						type="button"
						onClick={() => {
							setEditing(false);
						}}
						title="Cancel"
						className="timekeep-start timekeep-start--close">
						<ObsidianIcon icon="x" className="button-icon" />
					</button>
				</form>
			) : (
				<>
					{/* Currently running entry */}
					{currentEntry !== null &&
						currentEntry.startTime !== null && (
							<form
								className="timekeep-start-area"
								data-area="running"
								onSubmitCapture={onStop}>
								<div className="active-entry timekeep-name-wrapper">
									<span>
										<b>Currently Running:</b>
									</span>
									<div className="active-entry__details">
										<span className="active-entry__name">
											<b>Name: </b>{" "}
											{pathToEntry &&
												pathToEntry.length > 0 && (
													<span className="timekeep-path-to-entry">
														{pathToEntry.map(
															(path, index) => (
																<span
																	key={
																		path.id
																	}>
																	{path.name}

																	{index <
																		pathToEntry.length -
																			1 &&
																		" >"}
																</span>
															)
														)}
													</span>
												)}
										</span>
										<span className="active-entry__time">
											<b>{"Started at: "}</b>
											{formatTimestamp(
												currentEntry.startTime,
												settings
											)}
										</span>
									</div>
								</div>

								<button
									type="button"
									onClick={() => {
										setEditing(true);
										setEditingName(currentEntry.name);
									}}
									className="timekeep-start timekeep-start--edit">
									<ObsidianIcon
										icon="edit"
										className="button-icon"
									/>
								</button>

								<button
									type="submit"
									title="Stop"
									className="timekeep-start timekeep-start--stop">
									<ObsidianIcon
										icon="stop-circle"
										className="button-icon"
									/>
								</button>
							</form>
						)}
				</>
			)}

			{/* Start new entry */}
			<form
				className="timekeep-start-area"
				data-area="start"
				onSubmitCapture={onStart}>
				<div className="timekeep-name-wrapper">
					<label htmlFor="timekeepBlockName">
						Block Name:
						{currentEntry !== null &&
							currentEntry.startTime !== null && (
								<span className="timekeep-start-note">
									Starting a new task will pause the previous
									one
								</span>
							)}
					</label>

					<input
						id="timekeepBlockName"
						className="timekeep-name"
						placeholder="Example Block"
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</div>

				<button
					type="submit"
					title={isTimekeepRunning ? "Stop and start" : "Start"}
					className="timekeep-start">
					<ObsidianIcon icon="play" className="button-icon" />
				</button>
			</form>
		</div>
	);
}

import React, { ChangeEvent, useMemo, useState } from "react";
import {
	getEntriesOrdered,
	isEntryRunning,
	getEntryDuration,
	removeEntry,
	updateEntry,
	withSubEntry,
	getUniqueEntryHash,
	TimeEntry,
} from "../timekeep";
import TimesheetEntry from "./TimesheetEntry";
import { useSettings } from "src/hooks/use-settings-context";
import {
	CheckIcon,
	ChevronRight,
	EditIcon,
	PlayIcon,
	TrashIcon,
} from "lucide-react";
import {
	formatDuration,
	formatEditableTimestamp,
	formatTimestamp,
	unformatEditableTimestamp,
} from "src/utils";
import { useTimekeep } from "src/hooks/use-timekeep-context";

type Props = {
	entry: TimeEntry;
	indent: number;
};

type EditingState = {
	editing: boolean;
	name: string;
	startTime: string;
	endTime: string;
};

const DEFAULT_EDITING_STATE = {
	editing: false,
	name: "",
	startTime: "",
	endTime: "",
};

export default function TimesheetEntryGroup({ entry, indent }: Props) {
	const settings = useSettings();
	const isRunning = isEntryRunning(entry);
	const { setTimekeep, isTimekeepRunning } = useTimekeep();
	const isEditable = entry.subEntries !== null || entry.endTime !== null;

	const [editing, setEditing] = useState<EditingState>(DEFAULT_EDITING_STATE);

	// Persist the duration to prevent it updating real-time
	const duration = useMemo(() => {
		return formatDuration(getEntryDuration(entry));
	}, [entry]);

	const onClickStart = () => {
		setTimekeep((timekeep) => ({
			entries: updateEntry(
				timekeep.entries,
				entry,
				withSubEntry(entry, "")
			),
		}));
	};

	const onClickEdit = () => {
		if (editing.editing) {
			const newEntry = { ...entry, name: editing.name };

			// Update the start and end times for non groups
			if (newEntry.subEntries === null) {
				const startTime = unformatEditableTimestamp(
					editing.startTime,
					settings
				);
				if (startTime.isValid()) {
					newEntry.startTime = startTime;
				}

				const endTime = unformatEditableTimestamp(
					editing.endTime,
					settings
				);
				if (endTime.isValid()) {
					newEntry.endTime = endTime;
				}
			}

			// Reset the editing state
			setEditing(DEFAULT_EDITING_STATE);

			// Save the updated entry
			setTimekeep((timekeep) => ({
				entries: updateEntry(timekeep.entries, entry, newEntry),
			}));
		} else {
			// Set the editing state
			setEditing({
				name: entry.name,
				startTime: entry.startTime
					? formatEditableTimestamp(entry.startTime, settings)
					: "",
				endTime: entry.endTime
					? formatEditableTimestamp(entry.endTime, settings)
					: "",
				editing: true,
			});
		}
	};

	const onClickDelete = () => {
		if (!confirm("Are you sure you want to delete this entry?")) {
			return;
		}

		setTimekeep((timekeep) => ({
			entries: removeEntry(timekeep.entries, entry),
		}));
	};

	const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
		setEditing((editing) => ({
			...editing,
			name: event.target.value,
		}));
	};

	const onChangeStartTime = (event: ChangeEvent<HTMLInputElement>) => {
		setEditing((editing) => ({
			...editing,
			startTime: event.target.value,
		}));
	};

	const onChangeEndTime = (event: ChangeEvent<HTMLInputElement>) => {
		setEditing((editing) => ({
			...editing,
			endTime: event.target.value,
		}));
	};

	// Renders the name text (Input when editing)
	const renderName = editing.editing ? (
		<input
			className="timekeep-input"
			type="text"
			value={editing.name}
			onChange={onChangeName}
		/>
	) : (
		<span className="timekeep-name" title={entry.name}>
			{entry.name}
		</span>
	);

	// Renders the start time text (Input when editing)
	const renderStartTime =
		entry.startTime &&
		(editing.editing ? (
			<input
				className="timekeep-input"
				type="text"
				value={editing.startTime}
				onChange={onChangeStartTime}
			/>
		) : (
			<span className="timekeep-time">
				{formatTimestamp(entry.startTime, settings)}
			</span>
		));

	// Renders the end time text (Input when editing)
	const renderEndTime =
		entry.endTime &&
		(editing.editing ? (
			<input
				type="text"
				value={editing.endTime}
				onChange={onChangeEndTime}
			/>
		) : (
			<span className="timekeep-time">
				{formatTimestamp(entry.endTime, settings)}
			</span>
		));

	return (
		<>
			<tr className="timekeep-row">
				<td className="timekeep-col timekeep-col--name">
					<span
						style={{
							display: "inline-block",
							height: "1rem",
							width: `${indent * 0.5}em`,
						}}
					/>

					{indent > 0 && (
						<ChevronRight color="#888" width="1em" height="1em" />
					)}
					{renderName}
				</td>
				<td className="timekeep-col timekeep-col--time">
					{renderStartTime}
				</td>
				<td className="timekeep-col timekeep-col--time">
					{renderEndTime}
				</td>
				<td className="timekeep-col timekeep-col--duration">
					<span className="timekeep-time">{duration}</span>
				</td>
				<td className="timekeep-col timekeep-col--actions">
					<div className="timekeep-actions-wrapper">
						<button
							disabled={isTimekeepRunning}
							onClick={onClickStart}
							className="timekeep-action">
							<PlayIcon width="1em" height="1em" />
						</button>
						<button
							disabled={isRunning || !isEditable}
							onClick={onClickEdit}
							className="timekeep-action">
							{editing.editing ? (
								<CheckIcon width="1em" height="1em" />
							) : (
								<EditIcon width="1em" height="1em" />
							)}
						</button>
						<button
							onClick={onClickDelete}
							className="timekeep-action">
							<TrashIcon width="1em" height="1em" />
						</button>
					</div>
				</td>
			</tr>

			{entry.subEntries != null &&
				getEntriesOrdered(entry.subEntries, settings).map((entry) => (
					<TimesheetEntry
						key={getUniqueEntryHash(entry)}
						entry={entry}
						indent={indent + 1}
					/>
				))}
		</>
	);
}

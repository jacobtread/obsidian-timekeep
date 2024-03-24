import React, { ChangeEvent, useMemo, useState } from "react";
import {
	isEntryRunning,
	getEntryDuration,
	removeEntry,
	updateEntry,
	withSubEntry,
	isKeepRunning,
} from "@/timekeep";
import { useSettings } from "@/hooks/use-settings-context";
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
import { useTimekeep } from "@/hooks/use-timekeep-context";
import { TimeEntry } from "@/schema";

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

export default function TimesheetRow({ entry, indent }: Props) {
	const settings = useSettings();
	const isRunning = isEntryRunning(entry);
	const { setTimekeep, isTimekeepRunning } = useTimekeep();
	const [editingState, setEditingState] = useState<EditingState>(
		DEFAULT_EDITING_STATE
	);

	// Persist the duration to prevent it updating real-time
	const duration = useMemo(
		() => formatDuration(getEntryDuration(entry)),
		[entry]
	);

	const isEditable = entry.subEntries !== null || entry.endTime !== null;

	const onClickStart = () => {
		setTimekeep((timekeep) => {
			// Don't start if already running
			if (isKeepRunning(timekeep)) {
				return timekeep;
			}

			return {
				entries: updateEntry(
					timekeep.entries,
					entry,
					withSubEntry(entry, "")
				),
			};
		});
	};

	const onClickDelete = () => {
		if (!confirm("Are you sure you want to delete this entry?")) {
			return;
		}

		setTimekeep((timekeep) => ({
			entries: removeEntry(timekeep.entries, entry),
		}));
	};

	const onClickEdit = () => {
		if (editingState.editing) {
			const newEntry = { ...entry, name: editingState.name };

			// Update the start and end times for non groups
			if (newEntry.subEntries === null) {
				const startTime = unformatEditableTimestamp(
					editingState.startTime,
					settings
				);
				if (startTime.isValid()) {
					newEntry.startTime = startTime;
				}

				const endTime = unformatEditableTimestamp(
					editingState.endTime,
					settings
				);
				if (endTime.isValid()) {
					newEntry.endTime = endTime;
				}
			}

			// Reset the editing state
			setEditingState(DEFAULT_EDITING_STATE);

			// Save the updated entry
			setTimekeep((timekeep) => ({
				entries: updateEntry(timekeep.entries, entry, newEntry),
			}));
		} else {
			// Set the editing state
			setEditingState({
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

	const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
		setEditingState((editing) => ({
			...editing,
			name: event.target.value,
		}));
	};

	const onChangeStartTime = (event: ChangeEvent<HTMLInputElement>) => {
		setEditingState((editing) => ({
			...editing,
			startTime: event.target.value,
		}));
	};

	const onChangeEndTime = (event: ChangeEvent<HTMLInputElement>) => {
		setEditingState((editing) => ({
			...editing,
			endTime: event.target.value,
		}));
	};

	// Renders the name text (Input when editing)
	const renderName = editingState.editing ? (
		<input
			className="timekeep-input"
			type="text"
			value={editingState.name}
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
		(editingState.editing ? (
			<input
				className="timekeep-input"
				type="text"
				value={editingState.startTime}
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
		(editingState.editing ? (
			<input
				type="text"
				value={editingState.endTime}
				onChange={onChangeEndTime}
			/>
		) : (
			<span className="timekeep-time">
				{formatTimestamp(entry.endTime, settings)}
			</span>
		));

	return (
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
			<td className="timekeep-col timekeep-col--time">{renderEndTime}</td>
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
						{editingState.editing ? (
							<CheckIcon width="1em" height="1em" />
						) : (
							<EditIcon width="1em" height="1em" />
						)}
					</button>
					<button onClick={onClickDelete} className="timekeep-action">
						<TrashIcon width="1em" height="1em" />
					</button>
				</div>
			</td>
		</tr>
	);
}

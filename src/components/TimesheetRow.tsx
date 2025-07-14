import moment from "moment";
import { TimeEntry } from "@/timekeep/schema";
import React, { useMemo, useState } from "react";
import { useSettings } from "@/contexts/use-settings-context";
import { useTimekeepStore } from "@/contexts/use-timekeep-store";
import TimesheetRowEditing from "@/components/TimesheetRowEditing";
import TimesheetRowDuration from "@/components/TimesheetRowDuration";
import {
	updateEntry,
	createEntry,
	withSubEntry,
	isKeepRunning,
	isEntryRunning,
	getRunningEntry,
	setEntryCollapsed,
	stopRunningEntries,
} from "@/timekeep";

import { formatTimestamp } from "src/utils";

import ObsidianIcon from "./ObsidianIcon";
import TimekeepName from "./TimekeepName";

type Props = {
	entry: TimeEntry;
	indent: number;
};

export default function TimesheetRow({ entry, indent }: Props) {
	const settings = useSettings();
	const timekeepStore = useTimekeepStore();

	const [editing, setEditing] = useState(false);

	const { isSelfRunning, isRunningWithin, isInvalidEntry } = useMemo(() => {
		const isSelfRunning =
			entry.subEntries === null && isEntryRunning(entry);
		const isRunningWithin =
			entry.subEntries !== null &&
			getRunningEntry(entry.subEntries) !== null;

		const isInvalidEntry =
			entry.startTime !== null &&
			entry.endTime !== null &&
			entry.endTime.isBefore(entry.startTime);

		return { isSelfRunning, isRunningWithin, isInvalidEntry };
	}, [entry]);

	const onClickStart = () => {
		timekeepStore.setState((timekeep) => {
			const currentTime = moment();

			let entries = timekeep.entries;

			// Stop any already running entries
			if (isKeepRunning(timekeep)) {
				// Stop the running entry
				entries = stopRunningEntries(entries, currentTime);
			}

			if (entry.subEntries !== null || entry.startTime !== null) {
				let currentEntry = entry;

				// Ensure the current entry is stopped before using it
				if (entry.subEntries === null && entry.startTime !== null) {
					currentEntry = { ...entry, endTime: currentTime };
				}

				// If the entry has been started or is a group create a new child entry
				entries = updateEntry(
					entries,
					// Ensure the current entry is ended
					currentEntry,
					withSubEntry(currentEntry, "", currentTime)
				);
			} else {
				// If the entry hasn't been started then start it
				entries = updateEntry(
					entries,
					entry,
					createEntry(entry.name, currentTime)
				);
			}

			return {
				...timekeep,
				entries,
			};
		});
	};

	// Handles toggling the collapsed state for an entry
	const handleToggleCollapsed = () => {
		if (entry.subEntries === null) return;

		timekeepStore.setState((timekeep) => {
			const newEntry = setEntryCollapsed(entry, !entry.collapsed);
			const entries = updateEntry(timekeep.entries, entry, newEntry);
			return { ...timekeep, entries };
		});
	};

	if (editing) {
		return (
			<TimesheetRowEditing
				entry={entry}
				onFinishEditing={() => setEditing(false)}
			/>
		);
	}

	return (
		<tr
			className="timekeep-row"
			data-running={isSelfRunning}
			data-running-within={isRunningWithin}
			data-sub-entires={entry.subEntries !== null}
			data-invalid={isInvalidEntry}>
			<td
				className="timekeep-col timekeep-col--name"
				style={{ paddingLeft: `${(indent + 1) * 15}px` }}>
				<span
					className="timekeep-entry-name"
					title={entry.name}
					onClick={handleToggleCollapsed}>
					<TimekeepName name={entry.name} />

					{entry.subEntries !== null && (
						<ObsidianIcon
							icon={
								entry.collapsed ? "chevron-down" : "chevron-up"
							}
							className="timekeep-collapse-icon"
						/>
					)}
				</span>
			</td>
			<td className="timekeep-col timekeep-col--time">
				{entry.startTime && (
					<span className="timekeep-time">
						{formatTimestamp(entry.startTime, settings)}
					</span>
				)}
			</td>
			<td className="timekeep-col timekeep-col--time">
				{entry.endTime && (
					<span className="timekeep-time">
						{formatTimestamp(entry.endTime, settings)}
					</span>
				)}
			</td>
			<td className="timekeep-col timekeep-col--duration">
				<TimesheetRowDuration entry={entry} />
			</td>
			<td className="timekeep-col timekeep-col--actions">
				<div className="timekeep-actions-wrapper">
					<button onClick={onClickStart} className="timekeep-action">
						<ObsidianIcon icon="play" className="button-icon" />
					</button>
					<button
						onClick={() => setEditing(true)}
						className="timekeep-action">
						<ObsidianIcon icon="edit" className="button-icon" />
					</button>
				</div>
			</td>
		</tr>
	);
}

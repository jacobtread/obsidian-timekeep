import moment from "moment";
import { TimeEntry } from "@/schema";
import React, { useState, useCallback } from "react";
import { useSettings } from "@/contexts/use-settings-context";
import { useTimekeep } from "@/contexts/use-timekeep-context";
import TimesheetRowEditing from "@/components/TimesheetRowEditing";
import TimesheetRowDuration from "@/components/TimesheetRowDuration";
import {
	updateEntry,
	createEntry,
	withSubEntry,
	isKeepRunning,
	isEntryRunning,
	setEntryCollapsed,
} from "@/timekeep";

import { formatTimestamp } from "src/utils";

import ObsidianIcon from "./ObsidianIcon";

type Props = {
	entry: TimeEntry;
	indent: number;
};

export default function TimesheetRow({ entry, indent }: Props) {
	const isSelfRunning = entry.subEntries === null && isEntryRunning(entry);
	const settings = useSettings();
	const { setTimekeep, isTimekeepRunning } = useTimekeep();

	const [editing, setEditing] = useState(false);

	const onClickStart = () => {
		setTimekeep((timekeep) => {
			// Don't start if already running
			if (isKeepRunning(timekeep)) {
				return timekeep;
			}

			const startTime = moment();

			let entries;

			if (entry.subEntries !== null || entry.startTime !== null) {
				// If the entry has been started or is a group create a new child entry
				entries = updateEntry(
					timekeep.entries,
					entry,
					withSubEntry(entry, "", startTime)
				);
			} else {
				// If the entry hasn't been started then start it
				entries = updateEntry(
					timekeep.entries,
					entry,
					createEntry(entry.name, startTime)
				);
			}

			return {
				...timekeep,
				entries,
			};
		});
	};

	// Handles toggling the collapsed state for an entry
	const handleToggleCollapsed = useCallback(() => {
		if (entry.subEntries === null) return;

		setTimekeep((timekeep) => {
			const newEntry = setEntryCollapsed(entry, !entry.collapsed);
			const entries = updateEntry(timekeep.entries, entry, newEntry);
			return { ...timekeep, entries };
		});
	}, [setTimekeep, entry]);

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
			data-sub-entires={entry.subEntries !== null}>
			<td
				className="timekeep-col timekeep-col--name"
				style={{ paddingLeft: `${(indent + 1) * 15}px` }}>
				<span
					className="timekeep-entry-name"
					title={entry.name}
					onClick={handleToggleCollapsed}>
					{entry.name}

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
					<button
						disabled={isTimekeepRunning}
						onClick={onClickStart}
						className="timekeep-action">
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

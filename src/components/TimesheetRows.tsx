import { TimeEntry } from "@/schema";
import React, { useMemo, Fragment } from "react";
import TimesheetRow from "@/components/TimesheetRow";
import { useSettings } from "@/contexts/use-settings-context";
import { getEntriesOrdered, getUniqueEntryHash } from "@/timekeep";

type Props = {
	// Collection of entries
	entries: TimeEntry[];
	// Indentation for the entries
	indent: number;
	// Whether the timekeep is currently running
	isTimekeepRunning: boolean;
};

/**
 * Renders a collection of timesheet entries ordered based
 * on the current settings
 */
export default function TimesheetRows({
	entries,
	indent,
	isTimekeepRunning,
}: Props) {
	const settings = useSettings();
	// Memoized sub entries
	const entriesOrdered = useMemo(
		() => getEntriesOrdered(entries, settings),
		[entries, settings]
	);

	return entriesOrdered.map((entry) => (
		<Fragment key={getUniqueEntryHash(entry)}>
			<TimesheetRow
				entry={entry}
				indent={indent}
				isTimekeepRunning={isTimekeepRunning}
			/>

			{entry.subEntries !== null && !entry.collapsed && (
				<TimesheetRows
					entries={entry.subEntries}
					indent={indent + 1}
					isTimekeepRunning={isTimekeepRunning}
				/>
			)}
		</Fragment>
	));
}

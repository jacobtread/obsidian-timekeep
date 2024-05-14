import { TimeEntry } from "@/schema";
import React, { useMemo, Fragment } from "react";
import TimesheetRow from "@/components/TimesheetRow";
import { useSettings } from "@/contexts/use-settings-context";
import { getEntriesOrdered, getUniqueEntryHash } from "@/timekeep";

type Props = {
	// Collection of entries
	entries: TimeEntry[] | null;
	// Indentation for the entries
	indent: number;
};

/**
 * Renders a collection of timesheet entries ordered based
 * on the current settings
 */
export default function TimesheetRows({ entries, indent }: Props) {
	const settings = useSettings();
	// Memoized sub entries
	const entriesOrdered = useMemo(
		() => (entries ? getEntriesOrdered(entries, settings) : null),
		[entries, settings]
	);

	return (
		entriesOrdered != null &&
		entriesOrdered.map((entry) => (
			<Fragment key={getUniqueEntryHash(entry)}>
				<TimesheetRow entry={entry} indent={indent} />
				<TimesheetRows entries={entry.subEntries} indent={indent + 1} />
			</Fragment>
		))
	);
}


```dataviewjs
// Get the currently open file
const targetFile = this.app.vault.getFileByPath("Obsidian Timekeep.md");
if (!targetFile || !targetFile.name) return;

// Read the file
const text = await this.app.vault.read(targetFile);

// Get the timekeep plugin API
const timekeepPlugin = this.app.plugins.plugins.timekeep;

// Extract the timekeeps from the file text
const timekeeps = timekeepPlugin.extractTimekeepCodeblocks(text);

// Current time is required for unfinished entries
const currentTime = moment();

// Helper to format the duration number as human readable
function formatDuration(totalTime) {
	let ret = "";
	const duration = moment.duration(totalTime);
	const hours = Math.floor(duration.asHours());

	if (hours > 0) ret += hours + "h ";
	if (duration.minutes() > 0) ret += duration.minutes() + "m ";
	ret += duration.seconds() + "s";

	return ret.trim();
}

for (const timekeep of timekeeps) {
	let data = [];

	for (const entry of timekeep.entries) {
		let duration = timekeepPlugin.getEntryDuration(entry, currentTime);

		// Push the entry
		data.push([entry.name, duration]);
	}

	// Order the data by duration
	data.sort((a, b) => b[1] - a[1]);

	// Convert the durations to human readable
	const formattedData = data.map(([name, duration]) => [
		name,
		formatDuration(duration),
	]);

	// Put a table for the timekeep
	dv.table(["Name", "Duration"], formattedData);
}

```

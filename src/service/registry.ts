import type { TAbstractFile, Vault } from "obsidian";

import moment from "moment";
import { Component, TFile } from "obsidian";
import { limitFunction } from "p-limit";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";

import { createStore } from "@/store";
import {
	extractTimekeepCodeblocksWithPosition,
	load,
	replaceTimekeepCodeblock,
	type TimekeepPosition,
	type TimekeepWithPosition,
} from "@/timekeep/parser";
import { stripTimekeepRuntimeData, type Timekeep } from "@/timekeep/schema";
import { stopTimekeep } from "@/timekeep/update";

/** Entry within the timekeep registry */
export type TimekeepRegistryEntry = {
	file: TFile;
} & (TimekeepRegistryEntryFile | TimekeepRegistryEntryMarkdown);

/** Types of entries */
export enum TimekeepEntryItemType {
	FILE,
	MARKDOWN,
}

/** Registry entry for a single timekeep file */
export type TimekeepRegistryEntryFile = {
	type: TimekeepEntryItemType.FILE;
	timekeep: Timekeep;
};

/** Registry entry for a markdown file with multiple timekeeps */
export type TimekeepRegistryEntryMarkdown = {
	type: TimekeepEntryItemType.MARKDOWN;
	timekeeps: TimekeepWithPosition[];
};

/** Reference to a registry entry along with its file */
export type TimekeepRegistryItemRef = { file: TFile } & (
	| TimekeepRegistryItemFileRef
	| TimekeepRegistryItemMarkdownRef
);

/** Reference to a timekeep file entry */
export type TimekeepRegistryItemFileRef = {
	type: TimekeepEntryItemType.FILE;
};

/** Reference to a timekeep markdown file entry */
export type TimekeepRegistryItemMarkdownRef = {
	type: TimekeepEntryItemType.MARKDOWN;
	position: TimekeepPosition;
};

/**
 * Obsidian vault registry of all timekeep instances
 */
export class TimekeepRegistry extends Component {
	/** Vault that the registry is operating on */
	#vault: Vault;

	/** Store for entries within the registry */
	entries: Store<TimekeepRegistryEntry[]>;

	/** Settings access */
	settings: Store<TimekeepSettings>;

	/** Whether the store is initialized */
	initialized: boolean;

	/** Promise for the current initialization */
	loadPromise: Promise<void> | undefined;

	/** Background tasks the registry is currently performing */
	tasks: Promise<void>[];

	constructor(vault: Vault, settings: Store<TimekeepSettings>) {
		super();
		this.#vault = vault;
		this.entries = createStore([]);
		this.settings = settings;
		this.tasks = [];
	}

	onload() {
		const settings = this.settings.getState();
		if (!settings.registryEnabled) {
			return;
		}

		// Attach vault events
		const createEvent = this.#vault.on("create", this.onFileCreated.bind(this));
		const modifyEvent = this.#vault.on("modify", this.onFileModified.bind(this));
		const deleteEvent = this.#vault.on("delete", this.onFileRemoved.bind(this));

		// Register events for unloading
		this.registerEvent(createEvent);
		this.registerEvent(modifyEvent);
		this.registerEvent(deleteEvent);

		// Load the registry from the vault
		this.registerTask("loadFromVault", this.loadFromVault());
	}

	registerTask(name: string, task: Promise<void>) {
		this.tasks.push(task);

		task.then(() => (this.tasks = this.tasks.filter((other) => other !== task))).catch(
			(error) => {
				console.error("error occurred in registry task", name, error);
			}
		);
	}

	/**
	 * Wait for all currently active background registry
	 * tasks
	 */
	async waitTasks() {
		try {
			await Promise.allSettled(this.tasks);
		} catch {}
	}

	/**
	 * Handle the creation of new files with the vault, indexing them
	 * into the timekeep registry
	 *
	 * @param file The file that was created
	 */
	private onFileCreated(file: TAbstractFile) {
		if (!(file instanceof TFile)) {
			return;
		}

		const task = this.updateFromFile(file);
		this.registerTask("onFileCreated", task);
	}

	/**
	 * Handle a file being modified within the vault, reloads
	 * the change and indexes it again
	 *
	 * @param file The modified file
	 */
	private onFileModified(file: TAbstractFile) {
		if (!(file instanceof TFile)) {
			return;
		}

		const task = this.updateFromFile(file);
		this.registerTask("onFileModified", task);
	}

	/**
	 * Handles a file being removed from the vault removes
	 * the file if registered
	 *
	 * @param file The removed file
	 */
	private onFileRemoved(file: TAbstractFile) {
		if (!(file instanceof TFile)) {
			return;
		}

		this.entries.setState((entries) => {
			const newEntries = entries.filter((entry) => {
				return entry.file !== file;
			});
			return newEntries;
		});
	}

	/**
	 * Load the registry from the current vault
	 */
	async loadFromVault() {
		const settings = this.settings.getState();
		const entries = await TimekeepRegistry.getTimekeepsWithinVault(
			this.#vault,
			true,
			settings.registryConcurrencyLimit
		);
		this.entries.setState(entries);
	}

	/**
	 * Update a file within the vault loading its timekeeps then
	 * replacing them within the registry
	 *
	 * @param file
	 */
	async updateFromFile(file: TFile) {
		const entry = await TimekeepRegistry.getFileRegistryEntry(this.#vault, file, true);

		this.entries.setState((entries) => {
			const filteredEntries: TimekeepRegistryEntry[] = entries.filter(
				(entry) => entry.file !== file
			);
			const newEntries = [...filteredEntries];
			if (entry) {
				newEntries.push(entry);
			}
			return newEntries;
		});
	}

	async tryStopEntry(ref: TimekeepRegistryItemRef) {
		// Ensure the file still exists
		const file = ref.file;
		if (file === null) throw new Error("File no longer exists");

		// Replace the stored timekeep block with the new one
		await this.#vault.process(file, (data) => {
			switch (ref.type) {
				case TimekeepEntryItemType.MARKDOWN: {
					const position = ref.position;
					const timekeeps = extractTimekeepCodeblocksWithPosition(data);
					const targetTimekeep = timekeeps.find(
						(target) =>
							target.startLine === position.startLine &&
							target.endLine === position.endLine
					);

					// Don't modify the file if we can't find the timekeep
					if (targetTimekeep === undefined) {
						console.error(
							"Failed to stop timekeep: Unable to find timekeep within file"
						);
						return data;
					}

					const currentTime = moment();
					const initialTimekeep = targetTimekeep.timekeep;
					const updatedTimekeep = stopTimekeep(initialTimekeep, currentTime);

					return replaceTimekeepCodeblock(
						updatedTimekeep,
						data,
						targetTimekeep.startLine,
						targetTimekeep.endLine
					);
				}

				case TimekeepEntryItemType.FILE: {
					const loadResult = load(data);
					if (!loadResult.success) {
						console.error(
							"Failed to stop timekeep: Unable to parse timekeep within file"
						);
						return data;
					}

					const currentTime = moment();
					const initialTimekeep = loadResult.timekeep;
					const updatedTimekeep = stopTimekeep(initialTimekeep, currentTime);

					const stripped = stripTimekeepRuntimeData(updatedTimekeep);
					const serialized = JSON.stringify(stripped);
					return serialized;
				}

				/* v8 ignore start -- @preserve */
				default: {
					throw new Error("unknown entry type");
				}
				/* v8 ignore stop -- @preserve */
			}
		});
	}

	/**
	 * Collect all timekeep's within the provided vault
	 *
	 * @param vault The vault to search within
	 * @param cached Whether to perform a cached read when checking
	 * @param concurrencyLimit Maximum number of files to search at once
	 * @returns The collection of timekeeps with their positions in each file
	 */
	static async getTimekeepsWithinVault(
		vault: Vault,
		cached: boolean = true,
		concurrencyLimit: number = 15
	): Promise<TimekeepRegistryEntry[]> {
		const timekeepFiles = vault
			.getFiles()
			.filter((file) => file.extension === "timekeep" || file.extension === "md");

		// Concurrency limited parallel file processing
		const processFile = limitFunction(
			async (file: TFile): Promise<TimekeepRegistryEntry | null> => {
				return TimekeepRegistry.getFileRegistryEntry(vault, file, cached);
			},
			{ concurrency: concurrencyLimit }
		);

		const promises = timekeepFiles.map(processFile);
		const entries = await Promise.all(promises);

		// Exclude any markdown files without timekeeps
		return entries.filter((entry): entry is TimekeepRegistryEntry => entry !== null);
	}

	/**
	 * Create a timekeep registry entry from the provided file capturing
	 * the timekeeps within if present
	 *
	 * @param vault The vault to search within
	 * @param file The file to search within
	 * @param cached Whether to perform a cached read
	 * @returns The timekeep registry entry or null if unavailable
	 */
	static async getFileRegistryEntry(
		vault: Vault,
		file: TFile,
		cached: boolean = true
	): Promise<TimekeepRegistryEntry | null> {
		let content: string;
		if (cached) {
			content = await vault.cachedRead(file);
		} else {
			content = await vault.read(file);
		}

		if (file.extension === "md") {
			const timekeeps = extractTimekeepCodeblocksWithPosition(content);
			if (timekeeps.length < 1) {
				return null;
			}

			return {
				type: TimekeepEntryItemType.MARKDOWN,
				file,
				timekeeps,
			};
		}

		if (file.extension === "timekeep") {
			const loadResult = load(content);
			if (!loadResult.success) {
				return null;
			}

			const timekeep = loadResult.timekeep;
			return {
				type: TimekeepEntryItemType.FILE,
				file,
				timekeep,
			};
		}

		return null;
	}
}

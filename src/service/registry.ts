import { EventRef, TAbstractFile, TFile, Vault } from "obsidian";
import { limitFunction } from "p-limit";

import { createStore, Store } from "@/store";
import {
	extractTimekeepCodeblocksWithPosition,
	type TimekeepWithPosition,
} from "@/timekeep/parser";

type TimekeepRegistryEntry = {
	file: TFile;
	timekeeps: TimekeepWithPosition[];
};

/**
 * Obsidian vault registry of all timekeep instances
 */
export class TimekeepRegistry {
	/** Vault that the registry is operating on */
	#vault: Vault;

	/** Store for entries within the registry */
	entries: Store<TimekeepRegistryEntry[]>;

	/** Tracked events */
	#events: EventRef[] = [];

	/** Concurrency limit for registry indexing */
	concurrencyLimit: number = 10;

	constructor(vault: Vault) {
		this.#vault = vault;
		this.entries = createStore([]);
	}

	onload() {
		// Attach vault events
		const createEvent = this.#vault.on("create", this.onFileCreated.bind(this));
		const modifyEvent = this.#vault.on("modify", this.onFileModified.bind(this));
		const deleteEvent = this.#vault.on("delete", this.onFileRemoved.bind(this));
		this.#events.push(createEvent, modifyEvent, deleteEvent);

		// Load the registry from the vault
		void this.loadFromVault()
			//
			.catch((error) => {
				console.error("failed to load vault timekeep data", error);
			});
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

		void this.updateFromFile(file).catch(() =>
			console.error("failed to update timekeep changes within file")
		);
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

		void this.updateFromFile(file).catch(() =>
			console.error("failed to update timekeep changes within file")
		);
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
				console.log(file, entry.file, file === entry.file);
				return entry.file !== file;
			});
			return newEntries;
		});
	}

	/**
	 * Load the registry from the current vault
	 */
	async loadFromVault() {
		const entries = await TimekeepRegistry.getTimekeepsWithinVault(
			this.#vault,
			true,
			this.concurrencyLimit
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
		const timekeeps = await TimekeepRegistry.getTimekeepsWithinFile(this.#vault, file, true);

		this.entries.setState((entries) => {
			const filteredEntries: TimekeepRegistryEntry[] = entries.filter(
				(entry) => entry.file !== file
			);
			const newEntry: TimekeepRegistryEntry = {
				file,
				timekeeps,
			};

			const newEntries = [...filteredEntries, newEntry];
			return newEntries;
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
		const markdownFiles = vault.getMarkdownFiles();

		// Concurrency limited parallel file processing
		const processFile = limitFunction(
			async (file: TFile): Promise<TimekeepRegistryEntry> => {
				const timekeeps = await TimekeepRegistry.getTimekeepsWithinFile(
					vault,
					file,
					cached
				);

				return { file, timekeeps };
			},
			{ concurrency: concurrencyLimit }
		);

		const promises = markdownFiles.map(processFile);
		const entries = await Promise.all(promises);

		// Exclude any files without timekeeps
		return entries.filter((entry) => entry.timekeeps.length > 0);
	}

	/**
	 * Collect all timekeep's within the provided file in the
	 * provided vault
	 *
	 * @param vault The vault to search within
	 * @param file The file to search within
	 * @param cached Whether to perform a cached read
	 * @returns The collection of timekeeps with their positions in each file
	 */
	static async getTimekeepsWithinFile(
		vault: Vault,
		file: TFile,
		cached: boolean = true
	): Promise<TimekeepWithPosition[]> {
		let content: string;
		if (cached) {
			content = await vault.cachedRead(file);
		} else {
			content = await vault.read(file);
		}

		return extractTimekeepCodeblocksWithPosition(content);
	}
}

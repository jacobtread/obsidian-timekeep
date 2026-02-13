import { TFile, Vault } from "obsidian";
import { getEntriesNames } from "@/timekeep/queries";
import { extractTimekeepCodeblocksWithPosition } from "@/timekeep/parser";

import { isNumberText } from "./number";

const AUTOCOMPLETE_CACHE_MS = 1_000 * 10;

export class AutocompleteProvider {
	#names: string[] = [];
	#updatedAt = -1;
	#loadPromise: Promise<void> | null = null;

	async load(vault: Vault) {
		const namesSet = new Set<string>();
		await getNamesFromVault(vault, namesSet);

		const names = Array.from(namesSet)
			//
			.filter((name) => !isIgnoredName(name));

		names.sort();

		this.#names = names;
		this.#updatedAt = performance.now();
	}

	/**
	 * Loads the timekeep entry names for autocomplete purposes
	 *
	 * @param vault The vault to load names from
	 * @returns The collection of names
	 */
	async getNames(vault: Vault) {
		if (this.#loadPromise !== null) {
			await this.#loadPromise;
		}

		const now = performance.now();
		const elapsed = now - this.#updatedAt;

		if (this.#updatedAt === -1 || elapsed > AUTOCOMPLETE_CACHE_MS) {
			const promise = this.load(vault);

			this.#loadPromise = promise;
			await promise;
			this.#loadPromise = null;
		}

		return this.#names;
	}
}

/**
 * Checks if a name should be ignored from autocomplete
 *
 * @param name The name to check
 * @returns Whether the name should be ignored
 */
function isIgnoredName(name: string) {
	if (name.length < 1) {
		return true;
	}

	// Ignore "Part 1" "Part 2", "Block 1" ...etc
	if (name.startsWith("Part") || name.startsWith("Block")) {
		const parts = name.split(" ");
		if (parts.length !== 2) {
			return false;
		}

		const numericPart = parts[1];
		if (isNumberText(numericPart)) {
			return true;
		}
	}

	return false;
}

/**
 * Get all names of timekeep entries within all markdown files
 * within the entire vault
 *
 * @param vault The vault to read files from
 * @param names The set to store collected names in
 * @returns The list of all names within the vault
 */
export async function getNamesFromVault(vault: Vault, names: Set<string>) {
	const markdownFiles = vault.getMarkdownFiles();
	const batchSize = 10;

	const processFile = (file: TFile) => getNamesFromFile(vault, file, names);

	for (let i = 0; i < markdownFiles.length; i += batchSize) {
		const batch = markdownFiles.slice(i, i + batchSize);
		const results = await Promise.allSettled(batch.map(processFile));

		for (const result of results) {
			if (result.status === "rejected") {
				throw result.reason;
			}
		}
	}
}

/**
 * Get all names of timekeep entries within a file
 *
 * @param vault The vault to load the file from
 * @param file The file to load names from
 * @param names The set to store collected names in
 * @returns The list of names from all the timekeep entries in the file
 */
export async function getNamesFromFile(
	vault: Vault,
	file: TFile,
	names: Set<string>
) {
	const content = await vault.cachedRead(file);
	const timekeeps = extractTimekeepCodeblocksWithPosition(content);
	for (const timekeep of timekeeps) {
		getEntriesNames(timekeep.timekeep.entries, names);
	}
}

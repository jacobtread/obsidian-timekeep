import { Vault, debounce } from "obsidian";
import { useMemo, useState, useEffect } from "react";
import { AutocompleteProvider } from "@/utils/autocomplete";

/**
 * Hook to handle loading and updating autocomplete suggestions
 *
 * @param vault The vault to autocomplete from
 * @param autocomplete The autocomplete provider
 * @param value The current input value
 * @returns The list of available suggestions
 */
export function useAutocompleteSuggestions(
	vault: Vault,
	autocomplete: AutocompleteProvider,
	value: string
) {
	const [suggestions, setSuggestions] = useState<string[]>([]);

	const updateSuggestions = useMemo(() => {
		return debounce(
			(aborted: () => boolean) => {
				autocomplete
					.getNames(vault)
					.then((value) => {
						if (aborted()) return;
						setSuggestions(value);
					})
					.catch((error) => {
						console.error("failed to load suggestions", error);
					});
			},
			300,
			true
		);
	}, [autocomplete, vault]);

	useEffect(() => {
		let aborted = false;

		if (value.length < 1) {
			setSuggestions([]);
		} else {
			updateSuggestions(() => aborted);
		}

		return () => {
			aborted = true;
		};
	}, [value, updateSuggestions]);

	return suggestions;
}

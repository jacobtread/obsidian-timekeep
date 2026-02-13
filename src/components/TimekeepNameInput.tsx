import { debounce } from "obsidian";
import { useApp } from "@/contexts/use-app-context";
import { AutocompleteProvider } from "@/utils/autocomplete";
import { useAutocompleteSuggestions } from "@/hooks/useAutocompleteSuggestions";
import React, {
	useRef,
	useMemo,
	useState,
	useEffect,
	useCallback,
	ChangeEvent,
	KeyboardEvent,
} from "react";

interface Props {
	autocomplete: AutocompleteProvider;

	/** Current value of the input */
	value: string;

	/** Event listener for changes of the name value */
	onChange: (value: string) => void;
}

export default function TimekeepNameInput({
	autocomplete,
	value,
	onChange,
}: Props) {
	const app = useApp();

	const containerRef = useRef<HTMLDivElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const suggestions = useAutocompleteSuggestions(
		app.vault,
		autocomplete,
		value
	);

	const [suggestionIndex, setSuggestionIndex] = useState(-1);
	const [suggestionsOpen, setSuggestionsOpen] = useState(false);

	const filteredSuggestions = useMemo(() => {
		const lowerValue = value.toLowerCase().trim();
		if (lowerValue.length < 1) {
			return [];
		}

		return suggestions.filter((suggestion) => {
			return suggestion.toLowerCase().includes(lowerValue);
		});
	}, [suggestions, value]);

	const handleNameChange = useCallback(
		debounce((value: string, aborted: () => boolean) => {}, 300, true),
		[autocomplete, app]
	);

	const onInputFocus = useCallback(() => {
		setSuggestionsOpen(true);
	}, []);

	const onInputBlur = useCallback(() => {
		// setShowSuggestions(false);
	}, []);

	const onChangeSelection = (index: number) => {
		if (!suggestionsRef.current) {
			return;
		}

		const activeOption = suggestionsRef.current.querySelector(
			`#timekeepSuggestion-${index}`
		) as HTMLElement | null;

		if (!activeOption) {
			return;
		}

		activeOption.scrollIntoView({
			block: "nearest",
		});
	};

	const onSelectSuggestion = (value: string) => {
		onChange(value);
		setSuggestionsOpen(false);
		setSuggestionIndex(-1);
	};

	const onKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!suggestionsOpen && event.key === "ArrowDown") {
				setSuggestionsOpen(true);
				setSuggestionIndex(0);
				return;
			}

			switch (event.key) {
				case "ArrowDown":
					event.preventDefault();
					setSuggestionIndex((prev) => {
						const newValue =
							prev < filteredSuggestions.length - 1
								? prev + 1
								: prev;
						onChangeSelection(newValue);
						return newValue;
					});
					break;

				case "ArrowUp":
					event.preventDefault();
					setSuggestionIndex((prev) => {
						const newValue = prev > 0 ? prev - 1 : 0;
						onChangeSelection(newValue);
						return newValue;
					});

					break;

				case "Enter":
					if (suggestionIndex >= 0) {
						event.preventDefault();
						onSelectSuggestion(
							filteredSuggestions[suggestionIndex]
						);
					}
					break;

				case "Escape":
					setSuggestionsOpen(false);
					break;

				default:
					break;
			}
		},
		[onSelectSuggestion]
	);

	useEffect(() => {
		let aborted = false;

		handleNameChange(value, () => aborted);

		return () => {
			aborted = true;
		};
	}, [value, handleNameChange]);

	const onChangeValue = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			onChange(event.target.value);
			setSuggestionsOpen(true);
			setSuggestionIndex(-1);

			inputRef?.current?.focus();
		},
		[onChange]
	);

	useEffect(() => {
		function onClickOutside(event: MouseEvent | TouchEvent) {
			if (
				event.target &&
				event.target instanceof HTMLElement &&
				containerRef.current &&
				!containerRef.current.contains(event.target)
			) {
				setSuggestionsOpen(false);
			}
		}

		document.addEventListener("mousedown", onClickOutside);
		document.addEventListener("touchstart", onClickOutside);

		return () => {
			document.removeEventListener("mousedown", onClickOutside);
			document.removeEventListener("touchstart", onClickOutside);
		};
	}, []);

	return (
		<div className="timekeep-name-containers" ref={containerRef}>
			<input
				ref={inputRef}
				id="timekeepBlockName"
				className="timekeep-name"
				placeholder="Example Block"
				type="text"
				value={value}
				onChange={onChangeValue}
				onFocus={onInputFocus}
				onBlur={onInputBlur}
				onKeyDown={onKeyDown}
				role="combobox"
				aria-expanded={suggestionsOpen}
				aria-controls="timekeepSuggestions"
				aria-autocomplete="list"
				aria-activedescendant={
					suggestionIndex == -1
						? undefined
						: `timekeepSuggestion-${suggestionIndex}`
				}
			/>

			{suggestionsOpen && filteredSuggestions.length > 0 && (
				<div
					ref={suggestionsRef}
					id="timekeepSuggestions"
					className="timekeep-suggestions"
					role="listbox">
					{filteredSuggestions.map((value, index) => (
						<div
							key={index}
							id={`timekeepSuggestion-${index}`}
							role="option"
							aria-selected={suggestionIndex === index}
							className="timekeep-suggestion"
							onMouseDown={() => {
								onSelectSuggestion(value);
							}}>
							{value}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

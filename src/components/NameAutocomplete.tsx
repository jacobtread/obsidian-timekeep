import React, { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "@/contexts/use-app-context";

type Props = {
	value: string;
	onChange: (value: string) => void;
	onSelect?: (value: string) => void;
	inputId?: string;
	placeholder?: string;
};

/**
 * Autocomplete component for entry names that shows previously used names
 */
export default function NameAutocomplete({
	value,
	onChange,
	onSelect,
	inputId,
	placeholder,
}: Props) {
	const app = useApp();
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
		[]
	);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	// Load suggestions from plugin API
	useEffect(() => {
		const loadSuggestions = async () => {
			try {
				const plugin = app.plugins.plugins.timekeep;
				if (plugin && typeof plugin.getAllEntryNames === "function") {
					const names = await plugin.getAllEntryNames();
					setSuggestions(names);
				}
			} catch (error) {
				console.error("Failed to load entry names:", error);
			}
		};

		loadSuggestions();
	}, [app]);

	// Filter suggestions based on input value
	const filtered = useMemo(() => {
		if (!value.trim()) {
			return suggestions.slice(0, 10); // Show first 10 when empty
		}

		const lowerValue = value.toLowerCase();
		return suggestions
			.filter((name) => name.toLowerCase().includes(lowerValue))
			.slice(0, 10); // Limit to 10 suggestions
	}, [value, suggestions]);

	useEffect(() => {
		setFilteredSuggestions(filtered);
		setSelectedIndex(-1);
	}, [filtered]);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.value;
		onChange(newValue);
		setShowSuggestions(true);
	};

	const handleInputFocus = () => {
		setShowSuggestions(true);
	};

	const handleInputBlur = (event: React.FocusEvent) => {
		// Delay hiding suggestions to allow click events to fire
		setTimeout(() => {
			// Check if focus moved to suggestions container
			if (
				!suggestionsRef.current?.contains(document.activeElement) &&
				document.activeElement !== inputRef.current
			) {
				setShowSuggestions(false);
			}
		}, 200);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (showSuggestions && filteredSuggestions.length > 0) {
			switch (event.key) {
				case "ArrowDown":
					event.preventDefault();
					event.stopPropagation();
					setSelectedIndex((prev) =>
						prev < filteredSuggestions.length - 1 ? prev + 1 : prev
					);
					return;
				case "ArrowUp":
					event.preventDefault();
					event.stopPropagation();
					setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
					return;
				case "Enter":
					if (
						selectedIndex >= 0 &&
						selectedIndex < filteredSuggestions.length
					) {
						event.preventDefault();
						event.stopPropagation();
						selectSuggestion(filteredSuggestions[selectedIndex]);
					}
					return;
				case "Escape":
					event.preventDefault();
					event.stopPropagation();
					setShowSuggestions(false);
					setSelectedIndex(-1);
					return;
			}
		}
	};

	const selectSuggestion = (suggestion: string) => {
		onChange(suggestion);
		if (onSelect) {
			onSelect(suggestion);
		}
		setShowSuggestions(false);
		setSelectedIndex(-1);
		inputRef.current?.focus();
	};

	return (
		<div className="timekeep-autocomplete-wrapper">
			<input
				ref={inputRef}
				id={inputId}
				className="timekeep-name"
				placeholder={placeholder}
				type="text"
				value={value}
				onChange={handleInputChange}
				onFocus={handleInputFocus}
				onBlur={handleInputBlur}
				onKeyDown={handleKeyDown}
				autoComplete="off"
			/>
			{showSuggestions && filteredSuggestions.length > 0 && (
				<div
					ref={suggestionsRef}
					className="timekeep-autocomplete-suggestions"
					onMouseDown={(e) => e.preventDefault()}>
					{filteredSuggestions.map((suggestion, index) => (
						<div
							key={suggestion}
							className={`timekeep-autocomplete-suggestion ${
								index === selectedIndex ? "selected" : ""
							}`}
							onMouseDown={() => selectSuggestion(suggestion)}
							onMouseEnter={() => setSelectedIndex(index)}>
							{suggestion}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

import { App } from "obsidian";
import React, { useContext } from "react";

export const AppContext = React.createContext<App>(null!);

export function useApp(): App {
	return useContext(AppContext);
}

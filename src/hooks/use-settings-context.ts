import React, { useContext } from "react";
import { defaultSettings, TimekeepSettings } from "@/settings";

export const SettingsContext =
	React.createContext<TimekeepSettings>(defaultSettings);

export function useSettings(): TimekeepSettings {
	return useContext(SettingsContext);
}
